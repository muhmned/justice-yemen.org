const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSampleUsers() {
  try {
    // Sample users data
    const sampleUsers = [
      {
        username: 'editor',
        email: 'editor@sam-organization.org',
        password: 'editor123',
        role: 'editor'
      },
      {
        username: 'contributor',
        email: 'contributor@sam-organization.org',
        password: 'contributor123',
        role: 'contributor'
      },
      {
        username: 'reporter',
        email: 'reporter@sam-organization.org',
        password: 'reporter123',
        role: 'contributor'
      }
    ];

    for (const userData of sampleUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        console.log(`User ${userData.username} already exists`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          passwordHash: passwordHash,
          role: userData.role
        }
      });

      console.log(`Created user: ${user.username} (${user.role})`);
    }

    console.log('Sample users created successfully');
  } catch (error) {
    console.error('Error creating sample users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleUsers(); 