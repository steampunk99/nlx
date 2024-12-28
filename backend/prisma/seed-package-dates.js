const { PrismaClient } = require('@prisma/client');
const { addDays } = require('../src/utils/date.utils');

const prisma = new PrismaClient();

async function updatePackageDates() {
    // Find all node packages without activatedAt or expiresAt
    const nodePackages = await prisma.nodePackage.findMany({
        where: {
            OR: [
                { activatedAt: null },
                { expiresAt: null }
            ]
        },
        include: {
            package: true
        }
    });

    for (const np of nodePackages) {
        await prisma.nodePackage.update({
            where: { id: np.id },
            data: {
                activatedAt: np.createdAt,
                expiresAt: addDays(np.createdAt, np.package.duration)
            }
        });
    }

    console.log(`Updated ${nodePackages.length} node packages`);
}

updatePackageDates()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
