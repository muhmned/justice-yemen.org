import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance that can be shared across the application
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
