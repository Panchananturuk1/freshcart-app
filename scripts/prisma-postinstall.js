const { execSync } = require("node:child_process");

const hasPostgresEnv =
  Boolean(process.env.POSTGRES_PRISMA_URL) ||
  Boolean(process.env.POSTGRES_URL) ||
  Boolean(process.env.POSTGRES_URL_NON_POOLING);

const command = hasPostgresEnv
  ? "prisma generate --schema prisma/schema.postgres.prisma"
  : "prisma generate";

execSync(command, { stdio: "inherit" });

