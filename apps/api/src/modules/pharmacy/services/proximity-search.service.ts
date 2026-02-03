import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PharmacySearchDto,
  PharmacySearchResultDto,
} from '../dto/pharmacy.dto';
import {
  PROXIMITY_WEIGHTS,
  MAX_SEARCH_RADIUS_KM,
  EARTH_RADIUS_KM,
} from '../constants/pharmacy.constants';

interface PharmacyWithScore {
  pharmacy: any;
  distanceKm: number;
  estimatedShippingCents: number | null;
  availableProducts: number;
  totalProducts: number;
  hasAllProducts: boolean;
  score: number;
}

@Injectable()
export class ProximitySearchService {
  private readonly logger = new Logger(ProximitySearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search for pharmacies near a location with scoring
   *
   * Score formula: 0.35*dist + 0.25*frete + 0.20*SLA + 0.10*estoque + 0.10*rating
   *
   * Lower scores are better (like golf!)
   * - Distance: normalized by max radius (closer = lower score)
   * - Shipping: normalized by estimated cost (cheaper = lower score)
   * - SLA: normalized by max SLA (faster = lower score)
   * - Stock: 0 if has all products, 1 if missing some
   * - Rating: inverted (higher rating = lower score component)
   */
  async search(dto: PharmacySearchDto): Promise<PharmacySearchResultDto[]> {
    const radiusKm = dto.radiusKm ?? MAX_SEARCH_RADIUS_KM;
    const productIds = dto.productIds ?? [];

    // Get all pharmacies with location data
    let pharmacyQuery: any = {
      lat: { not: null },
      lng: { not: null },
    };

    // Filter by fulfillment capabilities
    if (dto.requiresDelivery) {
      pharmacyQuery.supportsDelivery = true;
    }
    if (dto.requiresPickup) {
      pharmacyQuery.supportsPickup = true;
    }

    const pharmacies = await this.prisma.pharmacy.findMany({
      where: pharmacyQuery,
      include: {
        address: true,
        inventory: productIds.length > 0
          ? {
              where: {
                productId: { in: productIds },
                inStock: true,
              },
              include: {
                product: true,
              },
            }
          : false,
      },
    });

    // Calculate scores for each pharmacy
    const results: PharmacyWithScore[] = [];

    for (const pharmacy of pharmacies) {
      // Calculate distance
      const distanceKm = this.haversineDistance(
        dto.lat,
        dto.lng,
        pharmacy.lat!,
        pharmacy.lng!,
      );

      // Skip if outside radius
      if (distanceKm > radiusKm) {
        continue;
      }

      // Check product availability
      let availableProducts = 0;
      let hasAllProducts = true;
      const totalProducts = productIds.length;

      if (productIds.length > 0 && pharmacy.inventory) {
        availableProducts = pharmacy.inventory.length;
        hasAllProducts = availableProducts === totalProducts;
      }

      // Estimate shipping cost (simple distance-based estimate)
      const estimatedShippingCents = dto.requiresDelivery !== false
        ? this.estimateShippingCost(distanceKm)
        : null;

      // Calculate score
      const score = this.calculateScore(
        distanceKm,
        radiusKm,
        estimatedShippingCents,
        pharmacy.slaMinutes,
        hasAllProducts,
        pharmacy.rating,
      );

      results.push({
        pharmacy,
        distanceKm,
        estimatedShippingCents,
        availableProducts,
        totalProducts,
        hasAllProducts,
        score,
      });
    }

    // Sort by score (lower is better)
    results.sort((a, b) => a.score - b.score);

    this.logger.debug(`Found ${results.length} pharmacies within ${radiusKm}km`);

    return results.map((r) => this.mapToSearchResult(r));
  }

  /**
   * Calculate Haversine distance between two points in kilometers
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_KM * c;
  }

  /**
   * Estimate shipping cost based on distance
   * This is a simple approximation - in production, use actual carrier APIs
   */
  private estimateShippingCost(distanceKm: number): number {
    // Base cost: R$10.00 + R$1.50 per km
    const baseCents = 1000;
    const perKmCents = 150;
    return Math.round(baseCents + distanceKm * perKmCents);
  }

  /**
   * Calculate the proximity score
   *
   * Score = 0.35*dist + 0.25*frete + 0.20*SLA + 0.10*estoque + 0.10*rating
   *
   * All components are normalized to 0-1 range
   * Lower total score is better
   */
  private calculateScore(
    distanceKm: number,
    maxDistanceKm: number,
    shippingCents: number | null,
    slaMinutes: number,
    hasAllProducts: boolean,
    rating: number,
  ): number {
    // Normalize distance (0 = at location, 1 = at max radius)
    const distScore = distanceKm / maxDistanceKm;

    // Normalize shipping cost (0 = free, 1 = R$50 or more)
    const maxShippingCents = 5000;
    const shippingScore = shippingCents
      ? Math.min(shippingCents / maxShippingCents, 1)
      : 0;

    // Normalize SLA (0 = instant, 1 = 24 hours or more)
    const maxSlaMinutes = 24 * 60; // 24 hours
    const slaScore = Math.min(slaMinutes / maxSlaMinutes, 1);

    // Stock score (0 = has all, 1 = missing products)
    const stockScore = hasAllProducts ? 0 : 1;

    // Rating score (0 = 5 stars, 1 = 0 stars) - inverted
    const ratingScore = 1 - rating / 5;

    // Calculate weighted score
    const score =
      PROXIMITY_WEIGHTS.DISTANCE * distScore +
      PROXIMITY_WEIGHTS.SHIPPING_COST * shippingScore +
      PROXIMITY_WEIGHTS.SLA * slaScore +
      PROXIMITY_WEIGHTS.STOCK * stockScore +
      PROXIMITY_WEIGHTS.RATING * ratingScore;

    return Math.round(score * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Map to search result DTO
   */
  private mapToSearchResult(result: PharmacyWithScore): PharmacySearchResultDto {
    const { pharmacy } = result;

    return {
      id: pharmacy.id,
      name: pharmacy.name,
      cnpj: pharmacy.cnpjEnc,
      email: pharmacy.email,
      phone: pharmacy.phone,
      shippingOriginCep: pharmacy.shippingOriginCep,
      address: pharmacy.address
        ? {
            street: pharmacy.address.street,
            number: pharmacy.address.number,
            complement: pharmacy.address.complement,
            district: pharmacy.address.district,
            city: pharmacy.address.city,
            state: pharmacy.address.state,
            cep: pharmacy.address.cep,
          }
        : null,
      lat: pharmacy.lat,
      lng: pharmacy.lng,
      slaMinutes: pharmacy.slaMinutes,
      supportsPickup: pharmacy.supportsPickup,
      supportsDelivery: pharmacy.supportsDelivery,
      rating: pharmacy.rating,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
      distanceKm: Math.round(result.distanceKm * 100) / 100,
      estimatedShippingCents: result.estimatedShippingCents,
      score: result.score,
      hasAllProducts: result.hasAllProducts,
      availableProducts: result.availableProducts,
      totalProducts: result.totalProducts,
    };
  }
}
