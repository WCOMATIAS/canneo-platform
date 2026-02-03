import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import {
  MELHOR_ENVIO_URLS,
  DEFAULT_PACKAGE,
} from '../constants/shipping.constants';
import {
  MelhorEnvioQuoteRequestDto,
  MelhorEnvioQuoteResponseDto,
  MelhorEnvioCartItemDto,
} from '../dto';

interface MelhorEnvioTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

@Injectable()
export class MelhorEnvioService {
  private readonly logger = new Logger(MelhorEnvioService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const isSandbox = this.configService.get('MELHOR_ENVIO_SANDBOX', 'true') === 'true';
    this.baseUrl = isSandbox ? MELHOR_ENVIO_URLS.SANDBOX : MELHOR_ENVIO_URLS.PRODUCTION;
    this.clientId = this.configService.get('MELHOR_ENVIO_CLIENT_ID', '');
    this.clientSecret = this.configService.get('MELHOR_ENVIO_CLIENT_SECRET', '');
  }

  /**
   * Get shipping quotes from Melhor Envio
   */
  async getQuotes(
    pharmacyId: string,
    request: MelhorEnvioQuoteRequestDto
  ): Promise<MelhorEnvioQuoteResponseDto[]> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/shipment/calculate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio quote error: ${error}`);
        throw new BadRequestException('Erro ao calcular frete');
      }

      const data = await response.json();

      // Filter out services with errors
      return data.filter((service: MelhorEnvioQuoteResponseDto) => !service.error);
    } catch (error) {
      this.logger.error(
        'Failed to get shipping quotes',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao calcular frete');
    }
  }

  /**
   * Add items to cart (pre-purchase)
   */
  async addToCart(
    pharmacyId: string,
    items: MelhorEnvioCartItemDto[]
  ): Promise<{ cartId: string; items: string[] }> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/cart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify(items),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio cart error: ${error}`);
        throw new BadRequestException('Erro ao adicionar ao carrinho');
      }

      const data = await response.json();

      // Extract cart ID from response
      const itemIds = Array.isArray(data) ? data.map((item: { id: string }) => item.id) : [data.id];

      return {
        cartId: itemIds[0], // Use first item as cart reference
        items: itemIds,
      };
    } catch (error) {
      this.logger.error(
        'Failed to add to cart',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao adicionar ao carrinho');
    }
  }

  /**
   * Checkout cart (purchase labels)
   */
  async checkout(
    pharmacyId: string,
    cartItemIds: string[]
  ): Promise<{ success: boolean; orders: string[] }> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/shipment/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify({ orders: cartItemIds }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio checkout error: ${error}`);
        throw new BadRequestException('Erro ao finalizar compra de etiqueta');
      }

      const data = await response.json();

      return {
        success: true,
        orders: data.purchase?.orders || [],
      };
    } catch (error) {
      this.logger.error(
        'Failed to checkout',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao finalizar compra de etiqueta');
    }
  }

  /**
   * Generate shipping label
   */
  async generateLabel(
    pharmacyId: string,
    shipmentIds: string[]
  ): Promise<{ labels: Array<{ id: string; url: string }> }> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/shipment/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify({ orders: shipmentIds }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio generate label error: ${error}`);
        throw new BadRequestException('Erro ao gerar etiqueta');
      }

      const data = await response.json();

      return {
        labels: Object.entries(data).map(([id, info]: [string, any]) => ({
          id,
          url: info.label_url || '',
        })),
      };
    } catch (error) {
      this.logger.error(
        'Failed to generate label',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao gerar etiqueta');
    }
  }

  /**
   * Print shipping label
   */
  async printLabel(
    pharmacyId: string,
    shipmentIds: string[]
  ): Promise<{ url: string }> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/shipment/print`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify({
          mode: 'private',
          orders: shipmentIds,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio print label error: ${error}`);
        throw new BadRequestException('Erro ao imprimir etiqueta');
      }

      const data = await response.json();

      return { url: data.url || '' };
    } catch (error) {
      this.logger.error(
        'Failed to print label',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao imprimir etiqueta');
    }
  }

  /**
   * Track shipment
   */
  async track(
    pharmacyId: string,
    shipmentId: string
  ): Promise<{
    tracking: string;
    status: string;
    events: Array<{ date: string; status: string; description: string; location?: string }>;
  }> {
    const tokens = await this.getTokens(pharmacyId);

    if (!tokens) {
      throw new BadRequestException('Farmácia não possui integração com Melhor Envio');
    }

    try {
      const response = await fetch(`${this.baseUrl}/me/shipment/tracking`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'CANNEO (contato@canneo.com.br)',
        },
        body: JSON.stringify({ orders: [shipmentId] }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Melhor Envio tracking error: ${error}`);
        throw new BadRequestException('Erro ao rastrear envio');
      }

      const data = await response.json();
      const shipment = data[shipmentId];

      return {
        tracking: shipment?.tracking || '',
        status: shipment?.status || 'unknown',
        events: (shipment?.tracking_events || []).map((event: any) => ({
          date: event.date,
          status: event.status,
          description: event.description,
          location: event.location,
        })),
      };
    } catch (error) {
      this.logger.error(
        'Failed to track shipment',
        error instanceof Error ? error.stack : String(error)
      );
      throw new BadRequestException('Erro ao rastrear envio');
    }
  }

  /**
   * Get pharmacy's Melhor Envio tokens
   */
  private async getTokens(pharmacyId: string): Promise<MelhorEnvioTokens | null> {
    const tokenRecord = await this.prisma.melhorEnvioToken.findUnique({
      where: { pharmacyId },
    });

    if (!tokenRecord) {
      return null;
    }

    // Check if token needs refresh
    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      return this.refreshTokens(pharmacyId, tokenRecord.refreshTokenEnc || '');
    }

    // In production, decrypt the token
    // For now, return as-is (tokens should be encrypted at rest)
    return {
      accessToken: tokenRecord.accessTokenEnc,
      refreshToken: tokenRecord.refreshTokenEnc || undefined,
      expiresAt: tokenRecord.expiresAt || undefined,
    };
  }

  /**
   * Refresh expired tokens
   */
  private async refreshTokens(
    pharmacyId: string,
    refreshToken: string
  ): Promise<MelhorEnvioTokens | null> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        this.logger.error('Failed to refresh Melhor Envio token');
        return null;
      }

      const data = await response.json();

      // Update tokens in database
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

      await this.prisma.melhorEnvioToken.update({
        where: { pharmacyId },
        data: {
          accessTokenEnc: data.access_token,
          refreshTokenEnc: data.refresh_token,
          expiresAt,
        },
      });

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
      };
    } catch (error) {
      this.logger.error(
        'Failed to refresh tokens',
        error instanceof Error ? error.stack : String(error)
      );
      return null;
    }
  }

  /**
   * Calculate package dimensions for items
   */
  calculatePackageDimensions(
    items: Array<{ quantity: number; weightKg?: number; heightCm?: number; widthCm?: number; lengthCm?: number }>
  ): { height: number; width: number; length: number; weight: number } {
    // Simple implementation - in production, this should consider actual product dimensions
    const totalWeight = items.reduce(
      (sum, item) => sum + (item.weightKg || DEFAULT_PACKAGE.weight) * item.quantity,
      0
    );

    // Use maximum dimensions among items
    const height = Math.max(
      DEFAULT_PACKAGE.height,
      ...items.map((item) => item.heightCm || DEFAULT_PACKAGE.height)
    );
    const width = Math.max(
      DEFAULT_PACKAGE.width,
      ...items.map((item) => item.widthCm || DEFAULT_PACKAGE.width)
    );
    const length = Math.max(
      DEFAULT_PACKAGE.length,
      ...items.map((item) => item.lengthCm || DEFAULT_PACKAGE.length)
    );

    return {
      height,
      width,
      length,
      weight: totalWeight,
    };
  }
}
