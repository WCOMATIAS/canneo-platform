import { PrismaClient, UserRole, UserStatus, WalletOwnerType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting CANNEO database seed...\n');

  // ===========================================
  // 1. Tenant Principal
  // ===========================================
  console.log('📦 Creating tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'canneo-principal' },
    update: {},
    create: {
      name: 'CANNEO Principal',
      slug: 'canneo-principal',
      isActive: true,
    },
  });
  console.log(`   ✓ Tenant: ${tenant.name} (${tenant.id})`);

  // ===========================================
  // 2. Wallets do Sistema
  // ===========================================
  console.log('\n💰 Creating system wallets...');

  const platformWallet = await prisma.wallet.upsert({
    where: { id: 'platform-wallet' },
    update: {},
    create: {
      id: 'platform-wallet',
      tenantId: tenant.id,
      ownerType: WalletOwnerType.PLATFORM,
      ownerId: null,
      currency: 'BRL',
      balances: {
        create: {
          balanceTotal: 0,
          balancePending: 0,
          balanceAvailable: 0,
          balanceOnHold: 0,
          balanceWithdrawn: 0,
        },
      },
    },
  });
  console.log(`   ✓ Platform Wallet: ${platformWallet.id}`);

  const gatewayWallet = await prisma.wallet.upsert({
    where: { id: 'gateway-wallet' },
    update: {},
    create: {
      id: 'gateway-wallet',
      tenantId: tenant.id,
      ownerType: WalletOwnerType.GATEWAY,
      ownerId: null,
      currency: 'BRL',
      balances: {
        create: {
          balanceTotal: 0,
          balancePending: 0,
          balanceAvailable: 0,
          balanceOnHold: 0,
          balanceWithdrawn: 0,
        },
      },
    },
  });
  console.log(`   ✓ Gateway Wallet: ${gatewayWallet.id}`);

  // ===========================================
  // 3. Usuário Admin
  // ===========================================
  console.log('\n👤 Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@canneo.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@canneo.com.br',
      passwordHash: await hashPassword('Admin@123'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      fullName: 'Administrador CANNEO',
      phone: '+5511999999999',
    },
  });
  console.log(`   ✓ Admin: ${adminUser.email} (senha: Admin@123)`);

  // ===========================================
  // 4. Usuário Operations
  // ===========================================
  console.log('\n👤 Creating operations user...');
  const opsUser = await prisma.user.upsert({
    where: { email: 'operacoes@canneo.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'operacoes@canneo.com.br',
      passwordHash: await hashPassword('Ops@123456'),
      role: UserRole.OPERATIONS,
      status: UserStatus.ACTIVE,
      fullName: 'Operador CANNEO',
      phone: '+5511988888888',
    },
  });
  console.log(`   ✓ Operations: ${opsUser.email} (senha: Ops@123456)`);

  // ===========================================
  // 5. Médico de Teste
  // ===========================================
  console.log('\n🩺 Creating doctor user...');
  const doctorUser = await prisma.user.upsert({
    where: { email: 'medico@canneo.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'medico@canneo.com.br',
      passwordHash: await hashPassword('Medico@123'),
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      fullName: 'Dr. João Silva',
      phone: '+5511977777777',
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: doctorUser.id,
      crmNumber: '123456',
      crmUF: 'SP',
      specialty: 'Clínica Geral',
      verifiedStatus: 'VERIFIED',
      verifiedAt: new Date(),
    },
  });

  // Wallet do médico
  const doctorWallet = await prisma.wallet.upsert({
    where: { doctorId: doctor.id },
    update: {},
    create: {
      tenantId: tenant.id,
      ownerType: WalletOwnerType.DOCTOR,
      ownerId: doctor.id,
      doctorId: doctor.id,
      currency: 'BRL',
      balances: {
        create: {
          balanceTotal: 150000, // R$ 1.500,00
          balancePending: 30000,
          balanceAvailable: 120000,
          balanceOnHold: 0,
          balanceWithdrawn: 50000,
        },
      },
    },
  });

  // Conta bancária do médico
  await prisma.bankAccount.upsert({
    where: { id: `bank-${doctor.id}` },
    update: {},
    create: {
      id: `bank-${doctor.id}`,
      tenantId: tenant.id,
      ownerType: WalletOwnerType.DOCTOR,
      ownerId: doctor.id,
      doctorId: doctor.id,
      bankCode: '001',
      branch: '1234',
      account: '12345',
      accountDigit: '6',
      pixKeyEnc: 'encrypted:medico@canneo.com.br',
      verifiedAt: new Date(),
    },
  });

  console.log(`   ✓ Doctor: ${doctorUser.email} (senha: Medico@123)`);
  console.log(`   ✓ CRM: ${doctor.crmNumber}/${doctor.crmUF}`);
  console.log(`   ✓ Doctor Wallet: ${doctorWallet.id}`);

  // ===========================================
  // 6. Paciente de Teste
  // ===========================================
  console.log('\n🧑 Creating patient user...');
  const patientAddress = await prisma.address.create({
    data: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      cep: '01310100',
      lat: -23.5505,
      lng: -46.6333,
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'paciente@email.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'paciente@email.com',
      passwordHash: await hashPassword('Paciente@123'),
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      fullName: 'Maria Santos',
      phone: '+5511966666666',
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: patientUser.id,
      cpfEnc: 'encrypted:12345678900',
      birthDate: new Date('1990-05-15'),
      addressId: patientAddress.id,
    },
  });

  // Prontuário do paciente
  await prisma.medicalRecord.upsert({
    where: { patientId: patient.id },
    update: {},
    create: {
      patientId: patient.id,
    },
  });

  console.log(`   ✓ Patient: ${patientUser.email} (senha: Paciente@123)`);
  console.log(`   ✓ Address: ${patientAddress.city}/${patientAddress.state}`);

  // ===========================================
  // 7. Farmácia de Teste
  // ===========================================
  console.log('\n💊 Creating pharmacy...');
  const pharmacyAddress = await prisma.address.create({
    data: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Loja 1',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      cep: '01310200',
      lat: -23.5629,
      lng: -46.6544,
    },
  });

  const pharmacy = await prisma.pharmacy.upsert({
    where: { id: 'pharmacy-01' },
    update: {},
    create: {
      id: 'pharmacy-01',
      tenantId: tenant.id,
      name: 'Farmácia CANNEO SP',
      cnpjEnc: 'encrypted:12345678000199',
      phone: '+5511955555555',
      email: 'farmacia@canneo.com.br',
      addressId: pharmacyAddress.id,
      shippingOriginCep: '01310200',
      lat: -23.5629,
      lng: -46.6544,
      slaMinutes: 120,
      supportsPickup: true,
      supportsDelivery: true,
      rating: 4.8,
    },
  });

  // Wallet da farmácia
  const pharmacyWallet = await prisma.wallet.upsert({
    where: { pharmacyId: pharmacy.id },
    update: {},
    create: {
      tenantId: tenant.id,
      ownerType: WalletOwnerType.PHARMACY,
      ownerId: pharmacy.id,
      pharmacyId: pharmacy.id,
      currency: 'BRL',
      balances: {
        create: {
          balanceTotal: 500000, // R$ 5.000,00
          balancePending: 100000,
          balanceAvailable: 400000,
          balanceOnHold: 0,
          balanceWithdrawn: 200000,
        },
      },
    },
  });

  // Usuário da farmácia
  const pharmacyUser = await prisma.user.upsert({
    where: { email: 'farmacia@canneo.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'farmacia@canneo.com.br',
      passwordHash: await hashPassword('Farmacia@123'),
      role: UserRole.PHARMACY,
      status: UserStatus.ACTIVE,
      fullName: 'Farmacêutico Carlos',
      phone: '+5511955555555',
    },
  });

  await prisma.pharmacyUser.upsert({
    where: { userId: pharmacyUser.id },
    update: {},
    create: {
      pharmacyId: pharmacy.id,
      userId: pharmacyUser.id,
    },
  });

  console.log(`   ✓ Pharmacy: ${pharmacy.name}`);
  console.log(`   ✓ Pharmacy User: ${pharmacyUser.email} (senha: Farmacia@123)`);
  console.log(`   ✓ Pharmacy Wallet: ${pharmacyWallet.id}`);

  // ===========================================
  // 8. Produtos de Teste
  // ===========================================
  console.log('\n📦 Creating products...');
  const products = [
    {
      sku: 'CBD-OIL-10ML',
      name: 'Óleo CBD 10ml - Full Spectrum',
      description: 'Óleo de CBD full spectrum, 1000mg, 10ml',
    },
    {
      sku: 'CBD-CAPS-30',
      name: 'Cápsulas CBD 30un',
      description: 'Cápsulas de CBD 25mg cada, 30 unidades',
    },
    {
      sku: 'THC-CBD-OIL-30ML',
      name: 'Óleo THC:CBD 30ml',
      description: 'Óleo THC:CBD proporção 1:1, 30ml',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        pharmacyId: pharmacy.id,
        active: true,
      },
    });

    // Criar inventário para a farmácia
    await prisma.inventoryItem.upsert({
      where: {
        pharmacyId_productId: {
          pharmacyId: pharmacy.id,
          productId: product.id,
        },
      },
      update: {},
      create: {
        pharmacyId: pharmacy.id,
        productId: product.id,
        priceCents: Math.floor(Math.random() * 30000) + 10000, // R$ 100-400
        inStock: true,
        stockQty: Math.floor(Math.random() * 50) + 10,
      },
    });

    console.log(`   ✓ Product: ${product.name} (${product.sku})`);
  }

  // ===========================================
  // 9. Slots de Agendamento
  // ===========================================
  console.log('\n📅 Creating appointment slots...');
  const today = new Date();
  const slots = [];

  for (let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(9, 0, 0, 0);

    for (let hour = 9; hour <= 17; hour++) {
      const startsAt = new Date(date);
      startsAt.setHours(hour);

      const endsAt = new Date(startsAt);
      endsAt.setMinutes(30);

      slots.push({
        doctorId: doctor.id,
        startsAt,
        endsAt,
        isBooked: false,
      });
    }
  }

  await prisma.appointmentSlot.createMany({
    data: slots,
    skipDuplicates: true,
  });
  console.log(`   ✓ Created ${slots.length} appointment slots for the next 5 days`);

  // ===========================================
  // Resumo
  // ===========================================
  console.log('\n' + '='.repeat(50));
  console.log('✅ CANNEO Database Seed Complete!');
  console.log('='.repeat(50));
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:     admin@canneo.com.br / Admin@123');
  console.log('   Operations: operacoes@canneo.com.br / Ops@123456');
  console.log('   Doctor:    medico@canneo.com.br / Medico@123');
  console.log('   Patient:   paciente@email.com / Paciente@123');
  console.log('   Pharmacy:  farmacia@canneo.com.br / Farmacia@123');
  console.log('\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
