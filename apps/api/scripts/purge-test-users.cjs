'use strict';

const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { config } = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const catalog = require('../src/dev/dev-artist-catalog.json');

const envCandidates = [
  resolve(__dirname, '../../../.env'),
  resolve(process.cwd(), '.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

process.env.DATABASE_URL ??= 'postgresql://nechto:nechto@localhost:5432/nechto';

const keepEmails = catalog.artists.map((artist) => artist.email);

async function purgeTestUsers() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to purge against NODE_ENV=production');
  }

  const prisma = new PrismaClient();
  try {
    const junk = {
      user: { email: { notIn: keepEmails } },
    };
    await prisma.profile.updateMany({
      where: junk,
      data: { publishedAt: null },
    });
    await prisma.project.deleteMany({
      where: { profile: junk },
    });
    const removed = await prisma.user.deleteMany({
      where: { email: { notIn: keepEmails } },
    });
    return removed.count;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { keepEmails, purgeTestUsers };

if (require.main === module) {
  purgeTestUsers()
    .then((count) => {
      console.log(
        `Purged ${count} test user(s); kept ${keepEmails.length} seed artists`,
      );
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
