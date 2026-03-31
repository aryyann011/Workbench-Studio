import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 1. Grab the database URL from your .env file
const connectionString = process.env.DATABASE_URL!

// 2. Create a native Postgres connection pool
const pool = new Pool({ connectionString })

// 3. Wrap that pool in the Prisma 7 Adapter
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 4. Pass the adapter into PrismaClient so it knows exactly how to connect
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma