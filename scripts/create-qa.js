require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const saltRounds = parseInt(process.env.SALT_ROUNDS);
  return bcrypt.hash(password, saltRounds);
}

async function createQaUser() {    
  const qaName = process.env.QA_NAME;
  const qaPassword = process.env.QA_PASSWORD;
  const qaEmail = process.env.QA_EMAIL;

  try {
    const existingQa = await prisma.user.findUnique({
      where: { email : qaEmail },
    });

    if (existingQa) {
      console.log('QA user already exists');
      return;
    }

    const hashedPassword = await hashPassword(qaPassword);

    const qa = await prisma.user.create({
      data: {
        email: qaEmail,
        name: qaName,
        password: hashedPassword,
        role: 'QA',
      },
    });

    console.log('QA user created successfully:', qa.id);
  } catch (error) {
    console.error('Error creating QA user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createQaUser();