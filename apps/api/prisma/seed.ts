import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================================================
  // PLANS
  // ============================================================================

  const plans = [
    {
      name: 'SOLO',
      displayName: 'Solo',
      description: 'Para médicos que atendem individualmente',
      priceMonthly: 199.0,
      priceYearly: 1990.0, // ~17% desconto
      maxDoctors: 1,
      maxPatients: 100,
      maxConsultations: -1, // ilimitado
      features: [
        'Teleconsultas ilimitadas',
        'Prontuário eletrônico',
        'Prescrições digitais',
        'Laudo ANVISA',
        'Pacote ANVISA (PDF + ZIP)',
        'Suporte por email',
      ],
      sortOrder: 1,
    },
    {
      name: 'TEAM',
      displayName: 'Team',
      description: 'Para pequenas clínicas com até 5 médicos',
      priceMonthly: 399.0,
      priceYearly: 3990.0,
      maxDoctors: 5,
      maxPatients: 500,
      maxConsultations: -1,
      features: [
        'Tudo do plano Solo',
        'Até 5 médicos',
        'Secretárias ilimitadas',
        'Agenda compartilhada',
        'Relatórios básicos',
        'Suporte prioritário',
      ],
      sortOrder: 2,
    },
    {
      name: 'CLINIC',
      displayName: 'Clinic',
      description: 'Para clínicas maiores com equipe completa',
      priceMonthly: 799.0,
      priceYearly: 7990.0,
      maxDoctors: 20,
      maxPatients: 2000,
      maxConsultations: -1,
      features: [
        'Tudo do plano Team',
        'Até 20 médicos',
        'Múltiplas unidades',
        'Relatórios avançados',
        'API de integração',
        'Gerente de conta dedicado',
        'Suporte 24/7',
      ],
      sortOrder: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        maxDoctors: plan.maxDoctors,
        maxPatients: plan.maxPatients,
        maxConsultations: plan.maxConsultations,
        features: plan.features,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: {
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        maxDoctors: plan.maxDoctors,
        maxPatients: plan.maxPatients,
        maxConsultations: plan.maxConsultations,
        features: plan.features,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
    });
    console.log(`Plan ${plan.name} created/updated`);
  }

  // ============================================================================
  // LEGAL TERMS (versão inicial)
  // ============================================================================

  const legalTerms = [
    {
      type: 'TERMS_OF_USE',
      version: 'v1.0',
      title: 'Termos de Uso',
      content: `
# Termos de Uso - CANNEO

## 1. Aceitação dos Termos
Ao acessar e usar a plataforma CANNEO, você concorda com estes termos.

## 2. Serviços
A CANNEO oferece uma plataforma de telemedicina especializada em cannabis medicinal.

## 3. Responsabilidades do Médico
- Manter CRM ativo e regular
- Seguir normas do CFM e ANVISA
- Garantir sigilo médico

## 4. Privacidade
Seus dados são protegidos conforme nossa Política de Privacidade e LGPD.

## 5. Alterações
Podemos alterar estes termos a qualquer momento, notificando os usuários.

Última atualização: Janeiro 2026
      `.trim(),
    },
    {
      type: 'PRIVACY_POLICY',
      version: 'v1.0',
      title: 'Política de Privacidade',
      content: `
# Política de Privacidade - CANNEO

## 1. Dados Coletados
Coletamos dados necessários para prestação do serviço de telemedicina.

## 2. Uso dos Dados
Os dados são usados exclusivamente para:
- Prestação dos serviços médicos
- Cumprimento de obrigações legais (ANVISA, CFM)
- Melhoria da plataforma

## 3. Compartilhamento
Não vendemos dados. Compartilhamos apenas quando exigido por lei.

## 4. Seus Direitos (LGPD)
Você tem direito a acessar, corrigir e excluir seus dados.

## 5. Segurança
Utilizamos criptografia e práticas de segurança para proteger seus dados.

Última atualização: Janeiro 2026
      `.trim(),
    },
    {
      type: 'TCLE',
      version: 'v1.0',
      title: 'Termo de Consentimento Livre e Esclarecido',
      content: `
# Termo de Consentimento Livre e Esclarecido

## Tratamento com Cannabis Medicinal

Eu, paciente identificado neste sistema, declaro que:

1. Fui informado(a) sobre o tratamento proposto com produtos à base de cannabis
2. Compreendo os potenciais benefícios e riscos
3. Tive oportunidade de esclarecer todas as dúvidas
4. Autorizo o tratamento de forma voluntária
5. Posso revogar este consentimento a qualquer momento

Este termo está em conformidade com a RDC 327/2019 e RDC 660/2022 da ANVISA.
      `.trim(),
    },
    {
      type: 'TELECONSULTA',
      version: 'v1.0',
      title: 'Termo de Consentimento para Teleconsulta',
      content: `
# Termo de Consentimento para Teleconsulta

Declaro que:

1. Aceito realizar consulta médica por videoconferência
2. Compreendo as limitações da telemedicina
3. Disponho de ambiente adequado e privado
4. Autorizo a gravação (se aplicável) para fins de prontuário
5. Estou ciente de que poderei ser encaminhado(a) para atendimento presencial

Em conformidade com a Lei 13.989/2020 e Resolução CFM 2.314/2022.
      `.trim(),
    },
  ];

  for (const term of legalTerms) {
    await prisma.legalTerm.upsert({
      where: {
        type_version: {
          type: term.type,
          version: term.version,
        },
      },
      update: {
        title: term.title,
        content: term.content,
        isActive: true,
      },
      create: {
        type: term.type,
        version: term.version,
        title: term.title,
        content: term.content,
        isActive: true,
      },
    });
    console.log(`Legal term ${term.type} ${term.version} created/updated`);
  }

  // ============================================================================
  // CANNABIS PRODUCTS (catálogo inicial)
  // ============================================================================

  const products = [
    {
      name: 'Green Care Full Spectrum 3000mg',
      manufacturer: 'Green Care',
      activeCompound: 'Full Spectrum',
      concentration: '100mg/ml',
      thcPercentage: 0.3,
      cbdPercentage: 99.7,
      presentation: 'Óleo',
      volume: '30ml',
      administrationRoute: 'Sublingual',
      description: 'Óleo de cannabis full spectrum com alto teor de CBD',
    },
    {
      name: 'HempMeds CBD Isolado 1000mg',
      manufacturer: 'HempMeds',
      activeCompound: 'CBD Isolado',
      concentration: '33.3mg/ml',
      thcPercentage: 0,
      cbdPercentage: 100,
      presentation: 'Óleo',
      volume: '30ml',
      administrationRoute: 'Sublingual',
      description: 'CBD isolado sem THC',
    },
    {
      name: 'Ease Labs THC:CBD 1:1',
      manufacturer: 'Ease Labs',
      activeCompound: 'THC:CBD Balanceado',
      concentration: '25mg/ml cada',
      thcPercentage: 50,
      cbdPercentage: 50,
      presentation: 'Óleo',
      volume: '30ml',
      administrationRoute: 'Sublingual',
      description: 'Proporção equilibrada de THC e CBD',
    },
    {
      name: 'Abrace CBD 2000mg',
      manufacturer: 'Abrace',
      activeCompound: 'CBD',
      concentration: '66.6mg/ml',
      thcPercentage: 0,
      cbdPercentage: 100,
      presentation: 'Óleo',
      volume: '30ml',
      administrationRoute: 'Sublingual',
      description: 'CBD de alta concentração',
    },
  ];

  for (const product of products) {
    const existing = await prisma.cannabisProduct.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.cannabisProduct.create({
        data: product,
      });
      console.log(`Product ${product.name} created`);
    } else {
      console.log(`Product ${product.name} already exists`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
