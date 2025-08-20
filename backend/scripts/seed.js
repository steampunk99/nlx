// const { PrismaClient } = require('@prisma/client');
// const { calculateCommissions } = require('../src/utils/commission.utils');

// const prisma = new PrismaClient();

// async function seedPackagePurchase() {
//   try {
//     const referredUserId = 2;
  
//     const packageId =3;
//     const nodeId = 2;

//     // Start a transaction
//     await prisma.$transaction(async (tx) => {
//       // Create a NodePayment record
//       //get package price
//       const packagePrice = await tx.package.findUnique({
//         where: { id: packageId }
//       });

//       const payment = await tx.nodePayment.create({
//         data: {
//           nodeId,
//           packageId,
//           amount: "250000",
//           transactionId:"TRX6434U9843U8FCN3",
//           transactionDetails:"TRX6434U9843U8FCN3",
//           status: 'SUCCESSFUL',
//           paymentMethod: 'mobile-money',
//           type: 'SUBSCRIPTION',
//           phoneNumber: '0700000000',
//           createdAt: new Date(),
//           updatedAt: new Date()
//         },
//       });

//       // Create a NodePackage record
//       const nodePackage = await tx.nodePackage.create({
//         data: {
//           nodeId,
//           packageId,
//           status: 'ACTIVE',
//         },
//       });

//       // Update User A's status to 'ACTIVE'
//       await tx.user.update({
//         where: { id: referredUserId },
//         data: { status: 'ACTIVE' },
//       });

//       // Update User A's node status to 'ACTIVE'
//       await tx.node.update({
//         where: { id: nodeId },
//         data: { status: 'ACTIVE' },
//       });

    

//       // Calculate and distribute commissions
//       await calculateCommissions(nodeId, packagePrice.price, tx);
//     });

//     console.log('Package purchase seeded and commissions distributed successfully');
//   } catch (error) {
//     console.error('Error seeding package purchase and distributing commissions:', error);
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'luk23bonnie898@gmail.com' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: luk23bonnie898@gmail.com');
      return;
    }

    // Hash the default password
    const defaultPassword = 'HyperAdmin2025!'; // Change this to your preferred password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'hyperadmin',
        email: 'luk23bonnie898@gmail.com',
        password: hashedPassword,
        firstName: 'Hyper',
        lastName: 'Admin',
        username: 'hyperadmin',
        phone: '+256700000000', // Default phone - update as needed
        status: 'ACTIVE',
        role: 'ADMIN',
        isVerified: true,
        country: 'UG',
        avatarUrl: dicebearAvatar('Hyper', 'Admin')
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Username:', adminUser.username);
    console.log('🔑 Password:', defaultPassword);
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // keep connection for further seeding
  }
}

function dicebearAvatar(firstName, lastName) {
  const seed = encodeURIComponent(`${firstName} ${lastName}`.trim());
  return `https://api.dicebear.com/7.x/initials/png?seed=${seed}`;
}

async function upsertUser({ email, username, firstName, lastName, phone, status, role = 'USER', isVerified = false, country = 'UG', password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarUrl = dicebearAvatar(firstName, lastName);
  // Try find existing by email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({
      where: { email },
      data: {
        username,
        firstName,
        lastName,
        phone,
        status,
        role,
        isVerified,
        country,
        password: hashedPassword,
        avatarUrl
      }
    });
  }
  return prisma.user.create({
    data: {
      email,
      username,
      firstName,
      lastName,
      phone,
      status,
      role,
      isVerified,
      country,
      password: hashedPassword,
      avatarUrl
    }
  });
}

async function ensureNodeForUser(userId) {
  const existing = await prisma.node.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.node.create({ data: { userId, status: 'ACTIVE', position: 'ONE', level: 1 } });
}

async function assignPackageToNode(nodeId, packageName) {
  const pkg = await prisma.package.findFirst({ where: { name: packageName } });
  if (!pkg) throw new Error(`Package not found: ${packageName}. Run seed-packages first.`);
  // If node already has a package, update it; else create
  const now = new Date();
  const expires = new Date(now.getTime());
  // duration is in days according to our schema intent
  // Fetch duration from package
  const durationDays = pkg.duration ?? 30;
  expires.setDate(expires.getDate() + durationDays);

  const existing = await prisma.nodePackage.findUnique({ where: { nodeId } });
  if (existing) {
    return prisma.nodePackage.update({
      where: { nodeId },
      data: {
        packageId: pkg.id,
        status: 'ACTIVE',
        activatedAt: now,
        expiresAt: expires
      }
    });
  }
  return prisma.nodePackage.create({
    data: {
      nodeId,
      packageId: pkg.id,
      status: 'ACTIVE',
      activatedAt: now,
      expiresAt: expires
    }
  });
}

async function seedDemoUsers() {
  try {
    // 1) Verified user with active package
    const user1 = await upsertUser({
      email: 'demo@active.com',
      username: 'demoactive',
      firstName: 'Demo',
      lastName: 'Active',
      phone: '+256700000001',
      status: 'ACTIVE',
      role: 'USER',
      isVerified: true,
      country: 'UG',
      password: 'DemoPass123!'
    });
    const node1 = await ensureNodeForUser(user1.id);
    await assignPackageToNode(node1.id, 'Gold');

    // 2) Inactive user with no package
    await upsertUser({
      email: 'demo.inactive@earndrip.com',
      username: 'demoinactive',
      firstName: 'Demo',
      lastName: 'Inactive',
      phone: '+256700000002',
      status: 'INACTIVE',
      role: 'USER',
      isVerified: false,
      country: 'UG',
      password: 'DemoPass123!'
    });

    console.log('✅ Demo users seeded.');
    console.log('Login with: demo@active.com / DemoPass123!');
  } catch (err) {
    console.error('❌ Error seeding demo users:', err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await seedAdmin();
  await seedDemoUsers();
}

main();