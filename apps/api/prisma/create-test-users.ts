import { PrismaClient, MembershipRole, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');

  // Hash da senha padrão: Canneo@2024
  const passwordHash = await bcrypt.hash('Canneo@2024', 10);

  // ============================================================================
  // 1. SUPER ADMIN
  // ============================================================================
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@canneo.com.br' },
    update: {},
    create: {
      email: 'superadmin@canneo.com.br',
      passwordHash,
      name: 'Super Administrador',
      phone: '11999999999',
      emailVerified: true,
      mfaEnabled: false,
    },
  });
  console.log('Super Admin created:', superAdmin.email);

  // ============================================================================
  // 2. ORGANIZAÇÃO DE TESTE (Clínica)
  // ============================================================================
  const organization = await prisma.organization.upsert({
    where: { slug: 'clinica-canneo-demo' },
    update: {},
    create: {
      name: 'Clínica CANNEO Demo',
      slug: 'clinica-canneo-demo',
      type: 'CLINICA',
      cnpj: '12345678000199',
      phone: '1133334444',
      email: 'contato@clinicademo.com.br',
      address: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Sala 100',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
      settings: {
        timezone: 'America/Sao_Paulo',
        defaultSlotDuration: 60,
      },
    },
  });
  console.log('Organization created:', organization.name);

  // Criar membership para Super Admin na organização
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: superAdmin.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      organizationId: organization.id,
      role: MembershipRole.SUPER_ADMIN,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  // ============================================================================
  // 3. ADMIN (Owner da Clínica)
  // ============================================================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinicademo.com.br' },
    update: {},
    create: {
      email: 'admin@clinicademo.com.br',
      passwordHash,
      name: 'Administrador da Clínica',
      phone: '11988887777',
      emailVerified: true,
      mfaEnabled: false,
    },
  });
  console.log('Admin created:', admin.email);

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: admin.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      organizationId: organization.id,
      role: MembershipRole.OWNER,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  // ============================================================================
  // 4. MÉDICO
  // ============================================================================
  const doctor = await prisma.user.upsert({
    where: { email: 'medico@clinicademo.com.br' },
    update: {},
    create: {
      email: 'medico@clinicademo.com.br',
      passwordHash,
      name: 'Dr. João Silva',
      phone: '11977776666',
      emailVerified: true,
      mfaEnabled: false,
    },
  });
  console.log('Doctor user created:', doctor.email);

  // Criar perfil de médico
  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: doctor.id },
    update: {},
    create: {
      userId: doctor.id,
      crm: '123456',
      ufCrm: 'SP',
      specialty: 'Clínica Médica',
      rqe: '78901',
      bio: 'Médico especialista em cannabis medicinal com 10 anos de experiência.',
    },
  });
  console.log('Doctor profile created:', doctorProfile.crm);

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: doctor.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: doctor.id,
      organizationId: organization.id,
      role: MembershipRole.DOCTOR,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  // ============================================================================
  // 5. SECRETÁRIA
  // ============================================================================
  const secretary = await prisma.user.upsert({
    where: { email: 'secretaria@clinicademo.com.br' },
    update: {},
    create: {
      email: 'secretaria@clinicademo.com.br',
      passwordHash,
      name: 'Maria Santos',
      phone: '11966665555',
      emailVerified: true,
      mfaEnabled: false,
    },
  });
  console.log('Secretary created:', secretary.email);

  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: secretary.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: secretary.id,
      organizationId: organization.id,
      role: MembershipRole.SECRETARY,
      isActive: true,
      joinedAt: new Date(),
    },
  });

  // ============================================================================
  // 6. SUBSCRIPTION (Trial)
  // ============================================================================
  const plan = await prisma.plan.findFirst({
    where: { name: 'TEAM' },
  });

  if (plan) {
    await prisma.subscription.upsert({
      where: { id: organization.id }, // Using org ID as workaround
      update: {},
      create: {
        organizationId: organization.id,
        planId: plan.id,
        status: SubscriptionStatus.TRIAL,
        billingCycle: 'monthly',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log('Subscription created (TRIAL)');
  }

  // ============================================================================
  // 7. DISPONIBILIDADE DO MÉDICO
  // ============================================================================
  const weekdays = [1, 2, 3, 4, 5]; // Segunda a Sexta
  for (const day of weekdays) {
    await prisma.availability.upsert({
      where: { id: `${doctorProfile.id}-${day}` },
      update: {},
      create: {
        organizationId: organization.id,
        doctorId: doctorProfile.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '18:00',
        slotDuration: 60,
        breakStart: '12:00',
        breakEnd: '13:00',
        isActive: true,
      },
    });
  }
  console.log('Availability created for weekdays');

  console.log('\n========================================');
  console.log('TEST USERS CREATED SUCCESSFULLY!');
  console.log('========================================');
  console.log('\nCredentials (all use password: Canneo@2024):');
  console.log('');
  console.log('SUPER ADMIN:');
  console.log('  Email: superadmin@canneo.com.br');
  console.log('  Role: Super Administrador (acesso total)');
  console.log('');
  console.log('ADMIN (Owner):');
  console.log('  Email: admin@clinicademo.com.br');
  console.log('  Role: Dono da Clínica');
  console.log('');
  console.log('MÉDICO:');
  console.log('  Email: medico@clinicademo.com.br');
  console.log('  Role: Médico (CRM 123456/SP)');
  console.log('');
  console.log('SECRETÁRIA:');
  console.log('  Email: secretaria@clinicademo.com.br');
  console.log('  Role: Secretária');
  console.log('');
  console.log('Organization: Clínica CANNEO Demo');
  console.log('Plan: TEAM (Trial - 30 dias)');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
