const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function dicebearAvatar(seedA, seedB, fallbackEmail) {
  const seedSource = `${seedA ?? ''} ${seedB ?? ''}`.trim() || fallbackEmail || 'User'
  const seed = encodeURIComponent(seedSource)
  return `https://api.dicebear.com/7.x/initials/png?seed=${seed}`
}

async function backfill() {
  try {
    const users = await prisma.user.findMany({
      where: { OR: [{ avatarUrl: null }, { avatarUrl: '' }] },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    if (!users.length) {
      console.log('✅ No users need backfilling.')
      return
    }

    console.log(`Found ${users.length} users missing avatarUrl. Backfilling...`)

    for (const u of users) {
      const url = dicebearAvatar(u.firstName, u.lastName, u.email)
      await prisma.user.update({
        where: { id: u.id },
        data: { avatarUrl: url }
      })
      console.log(`✓ Updated user ${u.id} -> ${url}`)
    }

    console.log('✅ Backfill complete.')
  } catch (err) {
    console.error('❌ Backfill failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

backfill()
