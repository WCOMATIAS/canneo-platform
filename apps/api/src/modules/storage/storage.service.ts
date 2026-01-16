import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

type StorageType = 'local' | 's3';

@Injectable()
export class StorageService implements OnModuleInit {
  private storageType: StorageType;
  private localPath: string;
  private baseUrl: string;

  // S3/MinIO (opcional para produção)
  private s3Client: any;
  private s3Bucket: string;

  constructor(private configService: ConfigService) {
    this.storageType = (this.configService.get<string>('STORAGE_TYPE') || 'local') as StorageType;
    this.localPath = this.configService.get<string>('STORAGE_LOCAL_PATH') || './uploads';
    this.baseUrl = this.configService.get<string>('STORAGE_BASE_URL') || '';
  }

  async onModuleInit() {
    if (this.storageType === 'local') {
      await this.ensureLocalDirectoryExists();
    } else if (this.storageType === 's3') {
      await this.initializeS3();
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private async ensureLocalDirectoryExists(): Promise<void> {
    const directories = [
      this.localPath,
      path.join(this.localPath, 'documents'),
      path.join(this.localPath, 'pdfs'),
      path.join(this.localPath, 'medical-records'),
      path.join(this.localPath, 'prescriptions'),
      path.join(this.localPath, 'anvisa-reports'),
      path.join(this.localPath, 'anvisa-packages'),
      path.join(this.localPath, 'patients'),
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private async initializeS3(): Promise<void> {
    // Inicializar cliente S3/MinIO se configurado
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKey = this.configService.get<string>('S3_ACCESS_KEY');
    const secretKey = this.configService.get<string>('S3_SECRET_KEY');
    this.s3Bucket = this.configService.get<string>('S3_BUCKET') || 'canneo-files';

    if (endpoint && accessKey && secretKey) {
      // Usar AWS SDK ou MinIO SDK
      // Para MVP, deixamos preparado mas não implementado
      console.log('S3/MinIO storage configured but not fully implemented in MVP');
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
    const uniqueFileName = `${uuidv4()}-${this.sanitizeFileName(fileName)}`;
    const filePath = `${folder}/${uniqueFileName}`;

    if (this.storageType === 'local') {
      return this.uploadFileLocal(file, filePath);
    } else {
      return this.uploadFileS3(file, filePath, mimeType);
    }
  }

  private async uploadFileLocal(
    file: Buffer,
    filePath: string,
  ): Promise<{ url: string; path: string }> {
    const fullPath = path.join(this.localPath, filePath);
    const dir = path.dirname(fullPath);

    // Garantir que o diretório existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(fullPath, file);

      // URL para acesso ao arquivo
      const url = this.baseUrl
        ? `${this.baseUrl}/uploads/${filePath}`
        : `/uploads/${filePath}`;

      return { url, path: filePath };
    } catch (error) {
      console.error('Local upload error:', error);
      throw new InternalServerErrorException('Erro ao fazer upload do arquivo');
    }
  }

  private async uploadFileS3(
    file: Buffer,
    filePath: string,
    mimeType: string,
  ): Promise<{ url: string; path: string }> {
    // Implementação S3/MinIO para produção
    // Por enquanto, fallback para local
    console.warn('S3 upload not implemented, falling back to local');
    return this.uploadFileLocal(file, filePath);
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
  // GET FILE
  // ============================================================================

  async getFile(filePath: string): Promise<Buffer> {
    if (this.storageType === 'local') {
      return this.getFileLocal(filePath);
    } else {
      return this.getFileS3(filePath);
    }
  }

  private async getFileLocal(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.localPath, filePath);

    if (!fs.existsSync(fullPath)) {
      throw new InternalServerErrorException('Arquivo não encontrado');
    }

    try {
      return fs.readFileSync(fullPath);
    } catch (error) {
      console.error('Local read error:', error);
      throw new InternalServerErrorException('Erro ao ler arquivo');
    }
  }

  private async getFileS3(filePath: string): Promise<Buffer> {
    // Implementação S3/MinIO para produção
    console.warn('S3 get not implemented, falling back to local');
    return this.getFileLocal(filePath);
  }

  // ============================================================================
  // GET SIGNED URL (for private files)
  // ============================================================================

  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<string> {
    if (this.storageType === 'local') {
      // Para local, retorna URL direta (em produção, usar token temporário)
      return this.baseUrl
        ? `${this.baseUrl}/uploads/${filePath}`
        : `/api/v1/storage/files/${encodeURIComponent(filePath)}`;
    } else {
      return this.getSignedUrlS3(filePath, expiresIn);
    }
  }

  private async getSignedUrlS3(
    filePath: string,
    expiresIn: number,
  ): Promise<string> {
    // Implementação S3/MinIO para produção
    console.warn('S3 signed URL not implemented, falling back to local');
    return `/api/v1/storage/files/${encodeURIComponent(filePath)}`;
  }

  // ============================================================================
  // DELETE FILE
  // ============================================================================

  async deleteFile(filePath: string): Promise<void> {
    if (this.storageType === 'local') {
      return this.deleteFileLocal(filePath);
    } else {
      return this.deleteFileS3(filePath);
    }
  }

  private async deleteFileLocal(filePath: string): Promise<void> {
    const fullPath = path.join(this.localPath, filePath);

    if (!fs.existsSync(fullPath)) {
      return; // Arquivo já não existe
    }

    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error('Local delete error:', error);
      throw new InternalServerErrorException('Erro ao excluir arquivo');
    }
  }

  private async deleteFileS3(filePath: string): Promise<void> {
    // Implementação S3/MinIO para produção
    console.warn('S3 delete not implemented, falling back to local');
    return this.deleteFileLocal(filePath);
  }

  // ============================================================================
  // LIST FILES
  // ============================================================================

  async listFiles(folder: string): Promise<string[]> {
    if (this.storageType === 'local') {
      return this.listFilesLocal(folder);
    } else {
      return this.listFilesS3(folder);
    }
  }

  private async listFilesLocal(folder: string): Promise<string[]> {
    const fullPath = path.join(this.localPath, folder);

    if (!fs.existsSync(fullPath)) {
      return [];
    }

    try {
      const files = fs.readdirSync(fullPath);
      return files.map((file) => `${folder}/${file}`);
    } catch (error) {
      console.error('Local list error:', error);
      throw new InternalServerErrorException('Erro ao listar arquivos');
    }
  }

  private async listFilesS3(folder: string): Promise<string[]> {
    // Implementação S3/MinIO para produção
    console.warn('S3 list not implemented, falling back to local');
    return this.listFilesLocal(folder);
  }

  // ============================================================================
  // CHECK FILE EXISTS
  // ============================================================================

  async fileExists(filePath: string): Promise<boolean> {
    if (this.storageType === 'local') {
      const fullPath = path.join(this.localPath, filePath);
      return fs.existsSync(fullPath);
    }
    // Para S3, implementar verificação
    return false;
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
    const folder = 'medical-records';
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
    const folder = 'prescriptions';
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
    const folder = 'anvisa-reports';
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
    const folder = `anvisa-packages/${reportId}`;

    // Upload de cada arquivo do pacote
    for (const file of files) {
      await this.uploadFile(
        file.buffer,
        file.name,
        'application/pdf',
        folder,
      );
    }

    // Criar arquivo de índice/checklist
    const indexContent = this.generatePackageIndex(reportId, files);
    await this.uploadFile(
      Buffer.from(indexContent, 'utf-8'),
      'INDICE.txt',
      'text/plain',
      folder,
    );

    // Retorna o path da pasta
    const url = this.baseUrl
      ? `${this.baseUrl}/uploads/${folder}`
      : `/uploads/${folder}`;

    return { url, path: folder };
  }

  private generatePackageIndex(
    reportId: string,
    files: Array<{ name: string; buffer: Buffer }>,
  ): string {
    const date = new Date().toLocaleDateString('pt-BR');
    let index = `PACOTE ANVISA - ${reportId}\n`;
    index += `Data de geração: ${date}\n`;
    index += `\n========================================\n`;
    index += `ARQUIVOS INCLUÍDOS:\n`;
    index += `========================================\n\n`;

    files.forEach((file, i) => {
      index += `${i + 1}. ${file.name}\n`;
    });

    index += `\n========================================\n`;
    index += `CHECKLIST PARA SUBMISSÃO:\n`;
    index += `========================================\n\n`;
    index += `[ ] Laudo médico completo e assinado\n`;
    index += `[ ] Prescrição médica\n`;
    index += `[ ] Termo de Consentimento (TCLE)\n`;
    index += `[ ] Documento de identidade do paciente\n`;
    index += `[ ] Comprovante de residência\n`;
    index += `\nGerado pelo sistema CANNEO\n`;

    return index;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private sanitizeFileName(fileName: string): string {
    // Remove caracteres especiais, mantém extensão
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais
      .replace(/_+/g, '_'); // Remove underscores duplicados
  }

  // ============================================================================
  // GET STORAGE INFO
  // ============================================================================

  getStorageInfo(): { type: StorageType; path?: string; bucket?: string } {
    if (this.storageType === 'local') {
      return {
        type: 'local',
        path: this.localPath,
      };
    }
    return {
      type: 's3',
      bucket: this.s3Bucket,
    };
  }
}
