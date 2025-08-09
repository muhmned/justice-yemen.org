const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createOrUpdateAdminUser() {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash('123456789', 10);

    // Check if system_admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'system_admin' }
    });

    if (existingAdmin) {
      // Update password and ensure role is correct
      await prisma.user.update({
        where: { username: 'system_admin' },
        data: { 
          passwordHash: passwordHash,
          role: 'system_admin' 
        }
      });
      console.log('System Admin user password updated successfully');
      return;
    }

    // Create system_admin user
    const adminUser = await prisma.user.create({
      data: {
      
        username: 'system_admin',
        passwordHash: passwordHash,
        email: 'system.admin@sam-organization.org',
        role: 'system_admin'
      }
    });

    console.log('Admin user created successfully:', adminUser.username);
  } catch (error) {
    console.error('Error creating or updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateAdminUser();
