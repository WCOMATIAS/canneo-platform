import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
    this.bucket = this.configService.get<string>('STORAGE_BUCKET') || 'canneo-files';

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  // ============================================================================
  // UPLOAD FILE
  // ============================================================================

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'documents',
  ): Promise<{ url: string; path: string }> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Storage not configured');
    }

    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new InternalServerErrorException('Erro ao fazer upload do arquivo');
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  }

  // ============================================================================
  // UPLOAD PDF
  // ============================================================================

  async uploadPdf(
    pdfBuffer: Buffer,
    fileName: string,
    folder: string = 'pdfs',
  ): Promise<{ url: string; path: string }> {
    return this.uploadFile(pdfBuffer, fileName, 'application/pdf', folder);
  }

  // ============================================================================
  // GET SIGNED URL (for private files)
  // ============================================================================

  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<string> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Storage not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Supabase signed URL error:', error);
      throw new InternalServerErrorException('Erro ao gerar URL assinada');
    }

    return data.signedUrl;
  }

  // ============================================================================
  // DELETE FILE
  // ============================================================================

  async deleteFile(filePath: string): Promise<void> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Storage not configured');
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new InternalServerErrorException('Erro ao excluir arquivo');
    }
  }

  // ============================================================================
  // LIST FILES
  // ============================================================================

  async listFiles(folder: string): Promise<string[]> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Storage not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .list(folder);

    if (error) {
      console.error('Supabase list error:', error);
      throw new InternalServerErrorException('Erro ao listar arquivos');
    }

    return data.map((file) => `${folder}/${file.name}`);
  }

  // ============================================================================
  // UPLOAD PATIENT DOCUMENT
  // ============================================================================

  async uploadPatientDocument(
    patientId: string,
    file: Buffer,
    fileName: string,
    mimeType: string,
    documentType: string,
  ): Promise<{ url: string; path: string }> {
    const folder = `patients/${patientId}/documents`;
    return this.uploadFile(file, fileName, mimeType, folder);
  }

  // ============================================================================
  // UPLOAD MEDICAL RECORD PDF
  // ============================================================================

  async uploadMedicalRecordPdf(
    recordId: string,
    pdfBuffer: Buffer,
  ): Promise<{ url: string; path: string }> {
    const folder = `medical-records`;
    const fileName = `prontuario-${recordId}.pdf`;
    return this.uploadPdf(pdfBuffer, fileName, folder);
  }

  // ============================================================================
  // UPLOAD PRESCRIPTION PDF
  // ============================================================================

  async uploadPrescriptionPdf(
    prescriptionId: string,
    pdfBuffer: Buffer,
  ): Promise<{ url: string; path: string }> {
    const folder = `prescriptions`;
    const fileName = `prescricao-${prescriptionId}.pdf`;
    return this.uploadPdf(pdfBuffer, fileName, folder);
  }

  // ============================================================================
  // UPLOAD ANVISA REPORT PDF
  // ============================================================================

  async uploadAnvisaReportPdf(
    reportId: string,
    pdfBuffer: Buffer,
  ): Promise<{ url: string; path: string }> {
    const folder = `anvisa-reports`;
    const fileName = `laudo-anvisa-${reportId}.pdf`;
    return this.uploadPdf(pdfBuffer, fileName, folder);
  }

  // ============================================================================
  // CREATE ANVISA PACKAGE (ZIP)
  // ============================================================================

  async createAnvisaPackage(
    reportId: string,
    files: Array<{ name: string; buffer: Buffer }>,
  ): Promise<{ url: string; path: string }> {
    // In production, use archiver or similar to create ZIP
    // For MVP, we'll upload individual files and return the folder path

    const folder = `anvisa-packages/${reportId}`;

    for (const file of files) {
      await this.uploadFile(
        file.buffer,
        file.name,
        'application/pdf',
        folder,
      );
    }

    // Return the folder path (frontend can list files)
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(folder);

    return {
      url: data.publicUrl,
      path: folder,
    };
  }
}
