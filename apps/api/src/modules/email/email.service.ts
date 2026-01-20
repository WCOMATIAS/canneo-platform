import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only');
    }

    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@canneo.com.br';
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'CANNEO';
  }

  /**
   * Envia um email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text, replyTo } = options;

    // Se Resend nao esta configurado, apenas logar
    if (!this.resend) {
      this.logger.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      this.logger.debug(`[EMAIL MOCK] Body: ${text || html.substring(0, 200)}`);
      return true;
    }

    try {
      const emailData: any = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      };

      if (text) {
        emailData.text = text;
      }

      if (replyTo) {
        emailData.replyTo = replyTo;
      }

      const result = await this.resend.emails.send(emailData);

      this.logger.log(`Email sent to ${to}: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Email de boas-vindas para novo usuario
   */
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Bem-vindo ao CANNEO!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .content h2 { color: #1f2937; }
            .content p { color: #4b5563; line-height: 1.6; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CANNEO</h1>
            </div>
            <div class="content">
              <h2>Ola, ${name}!</h2>
              <p>Seja bem-vindo(a) ao CANNEO, a plataforma de telemedicina especializada em cannabis medicinal.</p>
              <p>Sua conta foi criada com sucesso. Agora voce pode:</p>
              <ul>
                <li>Gerenciar seus pacientes</li>
                <li>Realizar teleconsultas</li>
                <li>Emitir prescricoes e laudos ANVISA</li>
              </ul>
              <a href="https://app.canneo.com.br/dashboard" class="button">Acessar Dashboard</a>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ola, ${name}! Bem-vindo ao CANNEO. Acesse: https://app.canneo.com.br/dashboard`,
    });
  }

  /**
   * Email de lembrete de consulta
   */
  async sendConsultationReminder(
    to: string,
    patientName: string,
    doctorName: string,
    scheduledAt: Date,
    consultationId: string,
  ): Promise<boolean> {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(scheduledAt);

    return this.sendEmail({
      to,
      subject: `Lembrete: Sua consulta esta marcada para ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-box p { margin: 8px 0; color: #374151; }
            .info-box strong { color: #1f2937; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lembrete de Consulta</h1>
            </div>
            <div class="content">
              <p>Ola, ${patientName}!</p>
              <p>Este e um lembrete da sua proxima consulta:</p>
              <div class="info-box">
                <p><strong>Medico:</strong> ${doctorName}</p>
                <p><strong>Data e Hora:</strong> ${formattedDate}</p>
                <p><strong>Tipo:</strong> Teleconsulta</p>
              </div>
              <p>Prepare-se para a consulta:</p>
              <ul>
                <li>Tenha seus documentos em maos</li>
                <li>Verifique sua conexao de internet</li>
                <li>Esteja em um ambiente tranquilo e bem iluminado</li>
              </ul>
              <a href="https://app.canneo.com.br/my-consultations/${consultationId}" class="button">Ver Detalhes da Consulta</a>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ola, ${patientName}! Lembrete: Sua consulta com ${doctorName} esta marcada para ${formattedDate}. Acesse: https://app.canneo.com.br/my-consultations/${consultationId}`,
    });
  }

  /**
   * Email de prescricao disponivel
   */
  async sendPrescriptionReady(
    to: string,
    patientName: string,
    productName: string,
    prescriptionId: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Sua prescricao esta disponivel!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .info-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Prescricao Disponivel</h1>
            </div>
            <div class="content">
              <p>Ola, ${patientName}!</p>
              <p>Sua prescricao foi assinada e esta disponivel para download.</p>
              <div class="info-box">
                <p><strong>Medicamento:</strong> ${productName}</p>
              </div>
              <p>Acesse seu portal para visualizar e baixar a prescricao.</p>
              <a href="https://app.canneo.com.br/my-prescriptions/${prescriptionId}" class="button">Ver Prescricao</a>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ola, ${patientName}! Sua prescricao de ${productName} esta disponivel. Acesse: https://app.canneo.com.br/my-prescriptions/${prescriptionId}`,
    });
  }

  /**
   * Email de reset de senha
   */
  async sendPasswordReset(to: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `https://app.canneo.com.br/auth/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to,
      subject: 'Redefinicao de senha - CANNEO',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0; color: #92400e; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Redefinir Senha</h1>
            </div>
            <div class="content">
              <p>Ola, ${name}!</p>
              <p>Recebemos uma solicitacao para redefinir sua senha.</p>
              <p>Clique no botao abaixo para criar uma nova senha:</p>
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
              <div class="warning">
                <p><strong>Atencao:</strong> Este link expira em 1 hora.</p>
                <p>Se voce nao solicitou a redefinicao de senha, ignore este email.</p>
              </div>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ola, ${name}! Acesse o link para redefinir sua senha: ${resetUrl}. Este link expira em 1 hora.`,
    });
  }

  /**
   * Email de convite para organizacao
   */
  async sendOrganizationInvite(
    to: string,
    inviterName: string,
    organizationName: string,
    inviteToken: string,
  ): Promise<boolean> {
    const inviteUrl = `https://app.canneo.com.br/auth/invite?token=${inviteToken}`;

    return this.sendEmail({
      to,
      subject: `Voce foi convidado para ${organizationName} - CANNEO`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .info-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Convite para Equipe</h1>
            </div>
            <div class="content">
              <p>Ola!</p>
              <p>${inviterName} convidou voce para fazer parte da equipe no CANNEO.</p>
              <div class="info-box">
                <p><strong>Organizacao:</strong> ${organizationName}</p>
              </div>
              <p>Clique no botao abaixo para aceitar o convite e criar sua conta:</p>
              <a href="${inviteUrl}" class="button">Aceitar Convite</a>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `${inviterName} convidou voce para ${organizationName} no CANNEO. Aceite o convite: ${inviteUrl}`,
    });
  }

  /**
   * Email de status ANVISA atualizado
   */
  async sendAnvisaStatusUpdate(
    to: string,
    patientName: string,
    status: string,
    reportId: string,
  ): Promise<boolean> {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
      APPROVED: {
        title: 'Laudo ANVISA Aprovado!',
        message: 'Seu laudo foi aprovado pela ANVISA. Voce ja pode importar seu medicamento.',
        color: '#10b981',
      },
      REJECTED: {
        title: 'Laudo ANVISA Necessita Revisao',
        message: 'Seu laudo precisa de ajustes. Entre em contato com seu medico.',
        color: '#ef4444',
      },
      SUBMITTED: {
        title: 'Laudo ANVISA Enviado',
        message: 'Seu laudo foi enviado para analise da ANVISA. Aguarde a resposta.',
        color: '#f59e0b',
      },
    };

    const statusInfo = statusMessages[status] || {
      title: 'Atualizacao do Laudo ANVISA',
      message: 'O status do seu laudo foi atualizado.',
      color: '#7c3aed',
    };

    return this.sendEmail({
      to,
      subject: statusInfo.title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: ${statusInfo.color}; padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .button { display: inline-block; background: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusInfo.title}</h1>
            </div>
            <div class="content">
              <p>Ola, ${patientName}!</p>
              <p>${statusInfo.message}</p>
              <a href="https://app.canneo.com.br/my-documents/${reportId}" class="button">Ver Detalhes</a>
            </div>
            <div class="footer">
              <p>CANNEO - Telemedicina Cannabis Medicinal</p>
              <p>Este email foi enviado automaticamente. Nao responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Ola, ${patientName}! ${statusInfo.message}`,
    });
  }
}
