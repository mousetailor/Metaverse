import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Start the HTTP API with its npm start script to load packages/db/.env.",
  );
}

const adapter = new PrismaPg({ connectionString });
const client = new PrismaClient({ adapter });

export { client };
