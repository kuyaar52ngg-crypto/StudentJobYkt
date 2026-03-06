const fs = require('fs');
const dts = fs.readFileSync('node_modules/.prisma/client/index.d.ts', 'utf8');

const regex = /export type PrismaClientOptions = \{([^}]*)\}/s;
const match = dts.match(regex);
if (match) {
    console.log("PrismaClientOptions keys:");
    console.log(match[1].trim());
} else {
    console.log("Not found");
}
