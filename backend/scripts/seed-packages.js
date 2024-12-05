const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPackages() {
    try {
        // Clear existing packages first
        await prisma.package.deleteMany();

        const packages = [
            {
                name: 'Starter Package',
                description: 'Entry-level package for new members',
                price: 50000.00,
                level: 2,
                status: 'ACTIVE',
                benefits: JSON.stringify({
                    'Network Depth': 2,
                    'Direct Commission Rate': '5%',
                    'Indirect Commission Rate': '2%',
                    'Max Direct Referrals': 5,
                    'Referral Bonus Percentage': 5,
                    'referralBonusPercentage': 5
                })
            },
            {
                name: 'Bronze Package',
                description: 'Intermediate package with more benefits',
                price: 100000.00,
                level: 3,
                status: 'ACTIVE',
                benefits: JSON.stringify({
                    'Network Depth': 3,
                    'Direct Commission Rate': '10%',
                    'Indirect Commission Rate': '5%',
                    'Max Direct Referrals': 10,
                    'Referral Bonus Percentage': 10,
                    'referralBonusPercentage': 10
                })
            },
            {
                name: 'Silver Package',
                description: 'Advanced package with enhanced earning potential',
                price: 250000.00,
                level: 4,
                status: 'ACTIVE',
                benefits: JSON.stringify({
                    'Network Depth': 4,
                    'Direct Commission Rate': '15%',
                    'Indirect Commission Rate': '8%',
                    'Max Direct Referrals': 20,
                    'Referral Bonus Percentage': 15,
                    'referralBonusPercentage': 15
                })
            },
            {
                name: 'Gold Package',
                description: 'Premium package with maximum benefits',
                price: 500000.00,
                level: 5,
                status: 'ACTIVE',
                benefits: JSON.stringify({
                    'Network Depth': 5,
                    'Direct Commission Rate': '20%',
                    'Indirect Commission Rate': '10%',
                    'Max Direct Referrals': 50,
                    'Referral Bonus Percentage': 20,
                    'referralBonusPercentage': 20
                })
            }
        ];

        // Create packages
        const createdPackages = await Promise.all(
            packages.map(packageData => 
                prisma.package.create({ data: packageData })
            )
        );

        console.log('Packages seeded successfully:', createdPackages);
    } catch (error) {
        console.error('Error seeding packages:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPackages();
