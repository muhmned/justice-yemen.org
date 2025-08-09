const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const { hashPassword } = require('./auth');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  rl.question('Admin username: ', async (username) => {
    rl.question('Admin email: ', async (email) => {
      rl.question('Admin password: ', async (password) => {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          console.log('User already exists!');
          rl.close();
          process.exit(1);
        }
        const passwordHash = await hashPassword(password);
        await prisma.user.create({
          data: {
            username,
            email,
            passwordHash,
            role: 'admin'
          }
        });
        console.log('Admin user created successfully!');
        rl.close();
        process.exit(0);
      });
    });
  });
}

main(); 