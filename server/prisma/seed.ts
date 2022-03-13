import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const bookData: Prisma.BookCreateInput[] = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const b of bookData) {
    const book = await prisma.book.create({
      data: b,
    })
    console.log(`Created user with id: ${book.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })