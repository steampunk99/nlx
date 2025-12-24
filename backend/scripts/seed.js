
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'earndrip@gmail.com' }
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: earndrip@gmail.com');
      return;
    }

    // Hash the default password
    const defaultPassword = 'HyperAdmin2025!'; // Change this to your preferred password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'hyperadmin',
        email: 'earndrip@gmail.com',
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


async function main() {
  await seedAdmin();

}

main();