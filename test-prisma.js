const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

let output = "";
output += "PrismaClient source: " + PrismaClient.toString() + "\n";
output += "!{} is " + !{} + "\n";

try {
  let n = {};
  const prisma1 = new PrismaClient(n);
  output += "PrismaClient({}) succeeded\n";
} catch (err) {
  output += "PrismaClient({}) failed: " + err.message + "\n";
}

fs.writeFileSync("output-test.txt", output);
