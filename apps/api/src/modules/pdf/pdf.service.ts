import { Injectable } from '@nestjs/common';

// Types for PDF data
interface PrescriptionPdfData {
  patient: {
    name: string;
    cpf: string;
    birthDate: string;
    address?: any;
  };
  doctor: {
    name: string;
    crm: string;
    ufCrm: string;
    specialty?: string;
  };
  prescription: {
    productName: string;
    concentration: string;
    dosage: string;
    quantity: string;
    instructions?: string;
    validUntil: string;
  };
  signatureHash?: string;
  signedAt?: string;
}

interface MedicalRecordPdfData {
  patient: {
    name: string;
    cpf: string;
    birthDate: string;
  };
  doctor: {
    name: string;
    crm: string;
    ufCrm: string;
  };
  consultation: {
    date: string;
    type: string;
  };
  clinicalData: any;
  signatureHash?: string;
  signedAt?: string;
}

interface AnvisaReportPdfData {
  formData: any;
  signatureHash?: string;
  signedAt?: string;
  protocolNumber?: string;
}

@Injectable()
export class PdfService {
  // ============================================================================
  // GENERATE PRESCRIPTION PDF (HTML template)
  // ============================================================================

  async generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
    const html = this.getPrescriptionTemplate(data);
    return this.htmlToPdf(html);
  }

  // ============================================================================
  // GENERATE MEDICAL RECORD PDF
  // ============================================================================

  async generateMedicalRecordPdf(data: MedicalRecordPdfData): Promise<Buffer> {
    const html = this.getMedicalRecordTemplate(data);
    return this.htmlToPdf(html);
  }

  // ============================================================================
  // GENERATE ANVISA REPORT PDF
  // ============================================================================

  async generateAnvisaReportPdf(data: AnvisaReportPdfData): Promise<Buffer> {
    const html = this.getAnvisaReportTemplate(data);
    return this.htmlToPdf(html);
  }

  // ============================================================================
  // HTML TO PDF CONVERSION
  // ============================================================================

  private async htmlToPdf(html: string): Promise<Buffer> {
    // In production, use puppeteer or similar
    // For MVP, we'll use a simple approach or external service

    // Option 1: Use puppeteer (install separately)
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: 'networkidle0' });
    // const pdf = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    // return pdf;

    // Option 2: Return HTML for now (frontend can use print-to-pdf)
    return Buffer.from(html, 'utf-8');
  }

  // ============================================================================
  // PRESCRIPTION TEMPLATE
  // ============================================================================

  private getPrescriptionTemplate(data: PrescriptionPdfData): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Prescricao Medica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    .header h1 { font-size: 18pt; margin-bottom: 5px; }
    .header h2 { font-size: 14pt; font-weight: normal; color: #444; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; font-size: 14pt; margin-bottom: 10px; border-bottom: 1px solid #ccc; }
    .row { display: flex; margin-bottom: 5px; }
    .label { font-weight: bold; min-width: 150px; }
    .value { flex: 1; }
    .prescription-box { border: 2px solid #000; padding: 20px; margin: 20px 0; }
    .prescription-box h3 { text-align: center; margin-bottom: 15px; font-size: 14pt; }
    .signature { margin-top: 50px; text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 300px; margin: 0 auto 10px; }
    .footer { margin-top: 30px; font-size: 10pt; color: #666; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    .hash { font-family: monospace; font-size: 8pt; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PRESCRICAO MEDICA</h1>
    <h2>Cannabis Medicinal - RDC 327/2019</h2>
  </div>

  <div class="section">
    <div class="section-title">PACIENTE</div>
    <div class="row"><span class="label">Nome:</span><span class="value">${data.patient.name}</span></div>
    <div class="row"><span class="label">CPF:</span><span class="value">${this.maskCpf(data.patient.cpf)}</span></div>
    <div class="row"><span class="label">Data de Nascimento:</span><span class="value">${this.formatDate(data.patient.birthDate)}</span></div>
  </div>

  <div class="prescription-box">
    <h3>PRESCRICAO</h3>
    <div class="row"><span class="label">Medicamento:</span><span class="value">${data.prescription.productName}</span></div>
    <div class="row"><span class="label">Concentracao:</span><span class="value">${data.prescription.concentration}</span></div>
    <div class="row"><span class="label">Posologia:</span><span class="value">${data.prescription.dosage}</span></div>
    <div class="row"><span class="label">Quantidade:</span><span class="value">${data.prescription.quantity}</span></div>
    ${data.prescription.instructions ? `<div class="row"><span class="label">Instrucoes:</span><span class="value">${data.prescription.instructions}</span></div>` : ''}
    <div class="row"><span class="label">Validade:</span><span class="value">${this.formatDate(data.prescription.validUntil)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">MEDICO PRESCRITOR</div>
    <div class="row"><span class="label">Nome:</span><span class="value">${data.doctor.name}</span></div>
    <div class="row"><span class="label">CRM:</span><span class="value">${data.doctor.crm}-${data.doctor.ufCrm}</span></div>
    ${data.doctor.specialty ? `<div class="row"><span class="label">Especialidade:</span><span class="value">${data.doctor.specialty}</span></div>` : ''}
  </div>

  ${
    data.signatureHash
      ? `
  <div class="signature">
    <div class="signature-line"></div>
    <div><strong>${data.doctor.name}</strong></div>
    <div>CRM ${data.doctor.crm}-${data.doctor.ufCrm}</div>
    <div style="margin-top: 10px; font-size: 10pt;">Assinado digitalmente em ${this.formatDateTime(data.signedAt!)}</div>
  </div>
  `
      : ''
  }

  <div class="footer">
    <p>Documento gerado pelo sistema CANNEO</p>
    ${data.signatureHash ? `<p class="hash">Hash: ${data.signatureHash}</p>` : ''}
  </div>
</body>
</html>
    `;
  }

  // ============================================================================
  // MEDICAL RECORD TEMPLATE
  // ============================================================================

  private getMedicalRecordTemplate(data: MedicalRecordPdfData): string {
    const clinicalData = data.clinicalData || {};

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Prontuario Medico</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; padding: 30px; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px; }
    .header h1 { font-size: 16pt; margin-bottom: 5px; }
    .section { margin-bottom: 15px; }
    .section-title { font-weight: bold; font-size: 12pt; background: #f0f0f0; padding: 5px 10px; margin-bottom: 8px; }
    .row { margin-bottom: 5px; padding-left: 10px; }
    .label { font-weight: bold; }
    .signature { margin-top: 40px; text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 250px; margin: 0 auto 5px; }
    .footer { margin-top: 20px; font-size: 9pt; color: #666; text-align: center; }
    .hash { font-family: monospace; font-size: 7pt; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PRONTUARIO MEDICO</h1>
    <div>Consulta: ${data.consultation.type} - ${this.formatDate(data.consultation.date)}</div>
  </div>

  <div class="section">
    <div class="section-title">IDENTIFICACAO DO PACIENTE</div>
    <div class="row"><span class="label">Nome:</span> ${data.patient.name}</div>
    <div class="row"><span class="label">CPF:</span> ${this.maskCpf(data.patient.cpf)}</div>
    <div class="row"><span class="label">Data de Nascimento:</span> ${this.formatDate(data.patient.birthDate)}</div>
  </div>

  ${clinicalData.chiefComplaint ? `
  <div class="section">
    <div class="section-title">QUEIXA PRINCIPAL</div>
    <div class="row">${clinicalData.chiefComplaint}</div>
  </div>
  ` : ''}

  ${clinicalData.historyOfPresentIllness ? `
  <div class="section">
    <div class="section-title">HISTORIA DA DOENCA ATUAL</div>
    <div class="row">${clinicalData.historyOfPresentIllness}</div>
  </div>
  ` : ''}

  ${clinicalData.vitalSigns ? `
  <div class="section">
    <div class="section-title">SINAIS VITAIS</div>
    ${clinicalData.vitalSigns.bloodPressure ? `<div class="row"><span class="label">PA:</span> ${clinicalData.vitalSigns.bloodPressure}</div>` : ''}
    ${clinicalData.vitalSigns.heartRate ? `<div class="row"><span class="label">FC:</span> ${clinicalData.vitalSigns.heartRate} bpm</div>` : ''}
    ${clinicalData.vitalSigns.weight ? `<div class="row"><span class="label">Peso:</span> ${clinicalData.vitalSigns.weight} kg</div>` : ''}
    ${clinicalData.vitalSigns.height ? `<div class="row"><span class="label">Altura:</span> ${clinicalData.vitalSigns.height} cm</div>` : ''}
  </div>
  ` : ''}

  ${clinicalData.primaryDiagnosis ? `
  <div class="section">
    <div class="section-title">DIAGNOSTICO</div>
    <div class="row"><span class="label">CID-10:</span> ${clinicalData.primaryDiagnosis.icd10Code} - ${clinicalData.primaryDiagnosis.description}</div>
  </div>
  ` : ''}

  ${clinicalData.treatmentPlan ? `
  <div class="section">
    <div class="section-title">PLANO DE TRATAMENTO</div>
    <div class="row">${clinicalData.treatmentPlan}</div>
  </div>
  ` : ''}

  ${clinicalData.cannabisRecommendation ? `
  <div class="section">
    <div class="section-title">RECOMENDACAO DE CANNABIS MEDICINAL</div>
    <div class="row"><span class="label">Tipo:</span> ${clinicalData.cannabisRecommendation.productType}</div>
    <div class="row"><span class="label">Concentracao:</span> ${clinicalData.cannabisRecommendation.concentration}</div>
    <div class="row"><span class="label">Via:</span> ${clinicalData.cannabisRecommendation.administration}</div>
    <div class="row"><span class="label">Dose Inicial:</span> ${clinicalData.cannabisRecommendation.startingDose}</div>
    <div class="row"><span class="label">Titulacao:</span> ${clinicalData.cannabisRecommendation.titration}</div>
  </div>
  ` : ''}

  ${data.signatureHash ? `
  <div class="signature">
    <div class="signature-line"></div>
    <div><strong>${data.doctor.name}</strong></div>
    <div>CRM ${data.doctor.crm}-${data.doctor.ufCrm}</div>
    <div style="margin-top: 5px; font-size: 9pt;">Assinado em ${this.formatDateTime(data.signedAt!)}</div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Documento confidencial - CANNEO</p>
    ${data.signatureHash ? `<p class="hash">Hash: ${data.signatureHash}</p>` : ''}
  </div>
</body>
</html>
    `;
  }

  // ============================================================================
  // ANVISA REPORT TEMPLATE
  // ============================================================================

  private getAnvisaReportTemplate(data: AnvisaReportPdfData): string {
    const fd = data.formData || {};

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Laudo Medico ANVISA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.3; padding: 25px; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h1 { font-size: 14pt; margin-bottom: 3px; }
    .header h2 { font-size: 11pt; font-weight: normal; color: #444; }
    .section { margin-bottom: 12px; border: 1px solid #ccc; }
    .section-title { font-weight: bold; font-size: 10pt; background: #e0e0e0; padding: 5px 8px; border-bottom: 1px solid #ccc; }
    .section-content { padding: 8px; }
    .row { margin-bottom: 3px; }
    .label { font-weight: bold; display: inline-block; min-width: 140px; }
    .signature { margin-top: 30px; text-align: center; }
    .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto 5px; }
    .footer { margin-top: 15px; font-size: 8pt; color: #666; text-align: center; }
    .legal { font-size: 8pt; margin-top: 10px; padding: 8px; background: #f9f9f9; border: 1px solid #ddd; }
    .hash { font-family: monospace; font-size: 7pt; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LAUDO MEDICO PARA IMPORTACAO DE PRODUTO A BASE DE CANNABIS</h1>
    <h2>RDC 660/2022 - ANVISA</h2>
    ${data.protocolNumber ? `<div style="margin-top: 5px;"><strong>Protocolo: ${data.protocolNumber}</strong></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">I. IDENTIFICACAO DO PACIENTE</div>
    <div class="section-content">
      <div class="row"><span class="label">Nome Completo:</span> ${fd.patient?.name || ''}</div>
      <div class="row"><span class="label">CPF:</span> ${this.maskCpf(fd.patient?.cpf || '')}</div>
      <div class="row"><span class="label">Data de Nascimento:</span> ${this.formatDate(fd.patient?.birthDate || '')}</div>
      <div class="row"><span class="label">Nacionalidade:</span> ${fd.patient?.nationality || 'Brasileira'}</div>
      <div class="row"><span class="label">Telefone:</span> ${fd.patient?.phone || ''}</div>
      <div class="row"><span class="label">Email:</span> ${fd.patient?.email || ''}</div>
      <div class="row"><span class="label">Endereco:</span> ${this.formatAddress(fd.patient?.address)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">II. IDENTIFICACAO DO MEDICO PRESCRITOR</div>
    <div class="section-content">
      <div class="row"><span class="label">Nome:</span> ${fd.doctor?.name || ''}</div>
      <div class="row"><span class="label">CRM:</span> ${fd.doctor?.crm || ''}-${fd.doctor?.ufCrm || ''}</div>
      <div class="row"><span class="label">Especialidade:</span> ${fd.doctor?.specialty || ''}</div>
      <div class="row"><span class="label">Telefone:</span> ${fd.doctor?.phone || ''}</div>
      <div class="row"><span class="label">Email:</span> ${fd.doctor?.email || ''}</div>
      <div class="row"><span class="label">Endereco:</span> ${this.formatAddress(fd.doctor?.address)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">III. DIAGNOSTICO E JUSTIFICATIVA CLINICA</div>
    <div class="section-content">
      <div class="row"><span class="label">CID-10:</span> ${fd.diagnosis?.icd10Code || ''} - ${fd.diagnosis?.icd10Description || ''}</div>
      <div class="row"><span class="label">Historia Clinica:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.clinicalHistory || ''}</div>
      <div class="row"><span class="label">Tratamentos Anteriores:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.previousTreatments || ''}</div>
      <div class="row"><span class="label">Falhas Terapeuticas:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.treatmentFailures || ''}</div>
      <div class="row"><span class="label">Evidencias Cientificas:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.scientificEvidence || ''}</div>
      <div class="row"><span class="label">Beneficios Esperados:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.expectedBenefits || ''}</div>
      <div class="row"><span class="label">Riscos Potenciais:</span></div>
      <div class="row" style="padding-left: 10px;">${fd.diagnosis?.potentialRisks || ''}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">IV. PRESCRICAO</div>
    <div class="section-content">
      <div class="row"><span class="label">Nome do Produto:</span> ${fd.prescription?.productName || ''}</div>
      <div class="row"><span class="label">Fabricante:</span> ${fd.prescription?.manufacturer || ''}</div>
      <div class="row"><span class="label">Composicao:</span> ${fd.prescription?.composition || ''}</div>
      <div class="row"><span class="label">Concentracao:</span> ${fd.prescription?.concentration || ''}</div>
      <div class="row"><span class="label">Apresentacao:</span> ${fd.prescription?.presentation || ''}</div>
      <div class="row"><span class="label">Via de Administracao:</span> ${fd.prescription?.administrationRoute || ''}</div>
      <div class="row"><span class="label">Posologia:</span> ${fd.prescription?.dosage || ''}</div>
      <div class="row"><span class="label">Frequencia:</span> ${fd.prescription?.frequency || ''}</div>
      <div class="row"><span class="label">Duracao:</span> ${fd.prescription?.duration || ''}</div>
      <div class="row"><span class="label">Quantidade:</span> ${fd.prescription?.quantity || ''}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">V. MONITORAMENTO</div>
    <div class="section-content">
      <div class="row"><span class="label">Frequencia de Retorno:</span> ${fd.monitoring?.returnFrequency || ''}</div>
      <div class="row"><span class="label">Parametros de Avaliacao:</span> ${(fd.monitoring?.evaluationParameters || []).join(', ')}</div>
      <div class="row"><span class="label">Criterios de Descontinuacao:</span> ${fd.monitoring?.discontinuationCriteria || ''}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">VI. DECLARACOES</div>
    <div class="section-content">
      <div class="row">${fd.declarations?.patientInformed ? '[X]' : '[ ]'} Paciente foi informado sobre o tratamento</div>
      <div class="row">${fd.declarations?.risksExplained ? '[X]' : '[ ]'} Riscos e beneficios foram explicados</div>
      <div class="row">${fd.declarations?.alternativesDiscussed ? '[X]' : '[ ]'} Alternativas terapeuticas foram discutidas</div>
      <div class="row">${fd.declarations?.consentObtained ? '[X]' : '[ ]'} Consentimento livre e esclarecido obtido</div>
    </div>
  </div>

  ${data.signatureHash ? `
  <div class="signature">
    <div class="signature-line"></div>
    <div><strong>${fd.doctor?.name || ''}</strong></div>
    <div>CRM ${fd.doctor?.crm || ''}-${fd.doctor?.ufCrm || ''}</div>
    <div style="margin-top: 3px; font-size: 8pt;">Assinado digitalmente em ${this.formatDateTime(data.signedAt!)}</div>
  </div>
  ` : ''}

  <div class="legal">
    <p>Declaro, sob as penas da lei, que as informacoes prestadas neste documento sao verdadeiras e de minha inteira responsabilidade.</p>
    <p>Este laudo tem validade de 1 (um) ano a partir da data de assinatura, conforme RDC 660/2022.</p>
  </div>

  <div class="footer">
    <p>Documento gerado pelo sistema CANNEO - Telemedicina Cannabis Medicinal</p>
    ${data.signatureHash ? `<p class="hash">Hash de verificacao: ${data.signatureHash}</p>` : ''}
  </div>
</body>
</html>
    `;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  private formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  private maskCpf(cpf: string): string {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    const parts = [
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
      address.zipCode,
    ].filter(Boolean);
    return parts.join(', ');
  }
}
