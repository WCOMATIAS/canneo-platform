import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoUtil {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private encryptionKey: Buffer;
  private signaturePepper: string;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('CPF_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('CPF_ENCRYPTION_KEY not configured');
    }
    // Garante que a chave tenha 32 bytes
    this.encryptionKey = crypto.scryptSync(key, 'salt', 32);

    this.signaturePepper = this.configService.get<string>('SIGNATURE_PEPPER') || 'default-pepper';
  }

  // ============================================================================
  // CPF ENCRYPTION
  // ============================================================================

  /**
   * Gera hash SHA256 do CPF para lookup rápido
   */
  hashCpf(cpf: string): string {
    const normalizedCpf = this.normalizeCpf(cpf);
    return crypto.createHash('sha256').update(normalizedCpf).digest('hex');
  }

  /**
   * Criptografa CPF para armazenamento seguro
   */
  encryptCpf(cpf: string): string {
    const normalizedCpf = this.normalizeCpf(cpf);

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

    let encrypted = cipher.update(normalizedCpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Retorna IV + Tag + Encrypted (tudo em hex)
    return iv.toString('hex') + tag.toString('hex') + encrypted;
  }

  /**
   * Descriptografa CPF
   */
  decryptCpf(encryptedCpf: string): string {
    try {
      const iv = Buffer.from(encryptedCpf.slice(0, this.ivLength * 2), 'hex');
      const tag = Buffer.from(
        encryptedCpf.slice(this.ivLength * 2, this.ivLength * 2 + this.tagLength * 2),
        'hex',
      );
      const encrypted = encryptedCpf.slice(this.ivLength * 2 + this.tagLength * 2);

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return this.formatCpf(decrypted);
    } catch (error) {
      throw new Error('Falha ao descriptografar CPF');
    }
  }

  /**
   * Extrai os últimos 4 dígitos do CPF
   */
  getLastFourDigits(cpf: string): string {
    const normalized = this.normalizeCpf(cpf);
    return normalized.slice(-4);
  }

  /**
   * Remove formatação do CPF (pontos e traço)
   */
  private normalizeCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Formata CPF com pontos e traço
   */
  private formatCpf(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // ============================================================================
  // DOCUMENT SIGNATURE
  // ============================================================================

  /**
   * Gera hash de assinatura para documentos
   * Usa payload determinístico + pepper + timestamp
   */
  generateSignatureHash(payload: object, timestamp: Date): string {
    // Ordena as chaves para garantir consistência
    const sortedPayload = this.sortObjectKeys(payload);
    const payloadString = JSON.stringify(sortedPayload);

    const dataToHash = `${payloadString}|${timestamp.toISOString()}|${this.signaturePepper}`;

    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  /**
   * Verifica se o hash de assinatura é válido
   */
  verifySignatureHash(payload: object, timestamp: Date, hash: string): boolean {
    const expectedHash = this.generateSignatureHash(payload, timestamp);
    return crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash));
  }

  /**
   * Ordena chaves do objeto recursivamente
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sortObjectKeys(item));
    }

    return Object.keys(obj)
      .sort()
      .reduce((sorted: any, key) => {
        sorted[key] = this.sortObjectKeys(obj[key]);
        return sorted;
      }, {});
  }

  // ============================================================================
  // GENERAL UTILITIES
  // ============================================================================

  /**
   * Gera token aleatório (para refresh tokens, etc)
   */
  generateToken(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gera código OTP numérico
   */
  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      otp += digits[bytes[i] % 10];
    }

    return otp;
  }

  /**
   * Hash genérico SHA256
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
