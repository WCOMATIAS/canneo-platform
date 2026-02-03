import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNCR_STATUS, SncrStatus } from '../constants/prescription.constants';

/**
 * SNCR Registration Data
 */
export interface SncrRegistrationData {
  prescriptionId: string;
  patientName: string;
  patientCpf?: string;
  doctorName: string;
  doctorCrm: string;
  doctorCrmUF: string;
  productName: string;
  thcPercent?: number;
  cbdPercent?: number;
  dosage: string;
  durationDays?: number;
  quantityText?: string;
  prescriptionDate: Date;
  pdfHash: string;
}

/**
 * SNCR Registration Result
 */
export interface SncrRegistrationResult {
  success: boolean;
  sncrNumber?: string;
  status: SncrStatus;
  message?: string;
  registeredAt?: Date;
}

/**
 * SNCR Status Check Result
 */
export interface SncrStatusResult {
  sncrNumber: string;
  status: SncrStatus;
  message?: string;
  lastCheckedAt: Date;
}

/**
 * SncrAdapterService - STUB IMPLEMENTATION
 *
 * SNCR = Sistema Nacional de Controle de Receituário
 *
 * In production, this service would:
 * 1. Connect to ANVISA's SNCR API (or authorized intermediary)
 * 2. Submit prescription data for registration
 * 3. Receive and store SNCR number
 * 4. Periodically check registration status
 *
 * This stub simulates the process for development/testing.
 */
@Injectable()
export class SncrAdapterService {
  private readonly logger = new Logger(SncrAdapterService.name);
  private readonly mockSncrCounter = Math.floor(Math.random() * 100000);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Register a prescription with SNCR (STUB)
   *
   * In production:
   * - Authenticate with SNCR API
   * - Submit prescription data (XML or JSON format)
   * - Handle response codes and errors
   * - Store registration confirmation
   */
  async register(data: SncrRegistrationData): Promise<SncrRegistrationResult> {
    this.logger.log(`[STUB] Registering prescription ${data.prescriptionId} with SNCR`);

    // STUB: Simulate API call delay
    await this.simulateApiDelay();

    // STUB: Simulate validation
    const validationResult = this.validateRegistrationData(data);
    if (!validationResult.valid) {
      this.logger.warn(`[STUB] SNCR validation failed: ${validationResult.message}`);
      return {
        success: false,
        status: SNCR_STATUS.REJECTED,
        message: validationResult.message,
      };
    }

    // STUB: Generate mock SNCR number
    // Format: SNCR-YYYY-XXXXXXXX (year + 8 random digits)
    const year = new Date().getFullYear();
    const sequence = String(Date.now()).slice(-8);
    const sncrNumber = `SNCR-${year}-${sequence}`;

    this.logger.log(`[STUB] SNCR registration successful: ${sncrNumber}`);

    return {
      success: true,
      sncrNumber,
      status: SNCR_STATUS.APPROVED,
      message: 'Prescription registered successfully (STUB)',
      registeredAt: new Date(),
    };
  }

  /**
   * Check the status of a SNCR registration (STUB)
   *
   * In production:
   * - Query SNCR API with the registration number
   * - Parse status response
   * - Handle errors and retries
   */
  async checkStatus(sncrNumber: string): Promise<SncrStatusResult> {
    this.logger.log(`[STUB] Checking SNCR status for ${sncrNumber}`);

    // STUB: Simulate API call delay
    await this.simulateApiDelay();

    // STUB: Always return APPROVED for valid-looking SNCR numbers
    if (sncrNumber.startsWith('SNCR-')) {
      return {
        sncrNumber,
        status: SNCR_STATUS.APPROVED,
        message: 'Registration approved and valid (STUB)',
        lastCheckedAt: new Date(),
      };
    }

    return {
      sncrNumber,
      status: SNCR_STATUS.REJECTED,
      message: 'Invalid SNCR number format (STUB)',
      lastCheckedAt: new Date(),
    };
  }

  /**
   * Cancel a SNCR registration (STUB)
   *
   * In production:
   * - Submit cancellation request to SNCR API
   * - Provide reason for cancellation
   * - Update local records
   */
  async cancel(
    sncrNumber: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[STUB] Cancelling SNCR registration ${sncrNumber}: ${reason}`);

    // STUB: Simulate API call delay
    await this.simulateApiDelay();

    return {
      success: true,
      message: 'SNCR registration cancelled successfully (STUB)',
    };
  }

  /**
   * Validate registration data before submission
   */
  private validateRegistrationData(
    data: SncrRegistrationData,
  ): { valid: boolean; message?: string } {
    if (!data.patientName) {
      return { valid: false, message: 'Patient name is required' };
    }

    if (!data.doctorCrm || !data.doctorCrmUF) {
      return { valid: false, message: 'Doctor CRM information is required' };
    }

    if (!data.productName) {
      return { valid: false, message: 'Product name is required' };
    }

    if (!data.dosage) {
      return { valid: false, message: 'Dosage information is required' };
    }

    if (!data.pdfHash) {
      return { valid: false, message: 'PDF hash is required for verification' };
    }

    return { valid: true };
  }

  /**
   * Simulate API delay for realistic behavior
   */
  private async simulateApiDelay(): Promise<void> {
    const delay = 100 + Math.random() * 200; // 100-300ms
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
