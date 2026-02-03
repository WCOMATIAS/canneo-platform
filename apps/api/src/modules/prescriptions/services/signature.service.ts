import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../../storage/storage.service';
import * as crypto from 'crypto';

/**
 * Prescription data for PDF generation
 */
export interface PrescriptionData {
  id: string;
  productName: string;
  thcPercent: number | null;
  cbdPercent: number | null;
  dosage: string;
  durationDays: number | null;
  quantityText: string | null;
  patientName: string;
  patientCpf?: string;
  doctorName: string;
  doctorCrm: string;
  doctorCrmUF: string;
  appointmentDate: Date;
}

/**
 * Signature result
 */
export interface SignatureResult {
  pdfBuffer: Buffer;
  hashPre: string;
  hashPost: string;
  signedAt: Date;
  fileKey: string;
  fileUrl: string;
}

/**
 * SignatureService - STUB IMPLEMENTATION
 *
 * In production, this service would:
 * 1. Generate a PDF using a template (PDFKit, Puppeteer, or external service)
 * 2. Calculate hash of the PDF before signing (hashPre)
 * 3. Sign the PDF using ICP-Brasil certificate (PAdES format)
 * 4. Calculate hash of the signed PDF (hashPost)
 * 5. Upload to S3
 *
 * This stub simulates the process for development/testing.
 */
@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Generate and sign a prescription PDF (STUB)
   *
   * In production:
   * - Use PDFKit or Puppeteer to generate PDF from template
   * - Use @signpdf/signpdf with ICP-Brasil certificate
   * - Implement PAdES-B or PAdES-LT signature
   */
  async generateAndSignPdf(prescription: PrescriptionData): Promise<SignatureResult> {
    this.logger.log(`[STUB] Generating and signing PDF for prescription ${prescription.id}`);

    // STUB: Generate mock PDF content
    const pdfContent = this.generateMockPdfContent(prescription);
    const pdfBuffer = Buffer.from(pdfContent, 'utf-8');

    // Calculate hash before signing (hashPre)
    const hashPre = this.calculateHash(pdfBuffer);
    this.logger.debug(`[STUB] hashPre: ${hashPre}`);

    // STUB: Simulate digital signature
    // In production: Use @signpdf/signpdf with ICP-Brasil P12 certificate
    const signedPdfBuffer = await this.simulateDigitalSignature(pdfBuffer, prescription);

    // Calculate hash after signing (hashPost)
    const hashPost = this.calculateHash(signedPdfBuffer);
    this.logger.debug(`[STUB] hashPost: ${hashPost}`);

    // Generate unique file key
    const fileKey = this.storageService.generateKey(
      'prescriptions',
      `prescription-${prescription.id}.pdf`,
    );

    // Upload to S3
    const uploadResult = await this.storageService.upload(
      signedPdfBuffer,
      fileKey,
      'application/pdf',
      {
        prescriptionId: prescription.id,
        hashPre,
        hashPost,
        signedAt: new Date().toISOString(),
      },
    );

    this.logger.log(`[STUB] PDF signed and uploaded: ${uploadResult.key}`);

    return {
      pdfBuffer: signedPdfBuffer,
      hashPre,
      hashPost,
      signedAt: new Date(),
      fileKey: uploadResult.key,
      fileUrl: `s3://${uploadResult.key}`,
    };
  }

  /**
   * Verify a signed PDF (STUB)
   *
   * In production:
   * - Download PDF from S3
   * - Extract and verify ICP-Brasil signature
   * - Validate certificate chain
   * - Check CRL/OCSP for revocation
   */
  async verifySignature(
    fileKey: string,
    expectedHashPre: string,
    expectedHashPost: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    this.logger.log(`[STUB] Verifying signature for ${fileKey}`);

    // STUB: Always return valid for development
    // In production: Implement actual signature verification

    return {
      valid: true,
    };
  }

  /**
   * Generate mock PDF content (STUB)
   *
   * In production: Use PDFKit template with proper formatting
   */
  private generateMockPdfContent(prescription: PrescriptionData): string {
    const content = `
%PDF-1.4
CANNEO - PRESCRIÇÃO MÉDICA
========================================

Data: ${prescription.appointmentDate.toLocaleDateString('pt-BR')}
ID: ${prescription.id}

PACIENTE
--------
Nome: ${prescription.patientName}
${prescription.patientCpf ? `CPF: ${prescription.patientCpf}` : ''}

MÉDICO
------
Nome: ${prescription.doctorName}
CRM: ${prescription.doctorCrm}/${prescription.doctorCrmUF}

PRESCRIÇÃO
----------
Produto: ${prescription.productName}
${prescription.thcPercent != null ? `THC: ${prescription.thcPercent}%` : ''}
${prescription.cbdPercent != null ? `CBD: ${prescription.cbdPercent}%` : ''}
Posologia: ${prescription.dosage}
${prescription.durationDays ? `Duração: ${prescription.durationDays} dias` : ''}
${prescription.quantityText ? `Quantidade: ${prescription.quantityText}` : ''}

========================================
Este documento foi assinado digitalmente
com certificado ICP-Brasil (STUB)
========================================
%%EOF
    `.trim();

    return content;
  }

  /**
   * Simulate digital signature (STUB)
   *
   * In production:
   * - Load ICP-Brasil P12 certificate
   * - Create PAdES signature using @signpdf/signpdf
   * - Embed signature in PDF
   */
  private async simulateDigitalSignature(
    pdfBuffer: Buffer,
    prescription: PrescriptionData,
  ): Promise<Buffer> {
    // STUB: Append signature metadata to simulate signed PDF
    const signatureBlock = `
--- ASSINATURA DIGITAL (STUB) ---
Assinante: ${prescription.doctorName}
CRM: ${prescription.doctorCrm}/${prescription.doctorCrmUF}
Data/Hora: ${new Date().toISOString()}
Algoritmo: SHA256withRSA (STUB)
Certificado: ICP-Brasil (STUB)
--- FIM DA ASSINATURA ---
    `.trim();

    return Buffer.concat([pdfBuffer, Buffer.from('\n\n' + signatureBlock)]);
  }

  /**
   * Calculate SHA-256 hash of a buffer
   */
  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
