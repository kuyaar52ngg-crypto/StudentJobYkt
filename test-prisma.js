require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

try {
    const prisma = new PrismaClient();

    prisma.user.count().then(c => {
        console.log("Users:", c);
        process.exit(0);
    }).catch(e => {
        console.error(e.message);
        process.exit(1);
    });
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
