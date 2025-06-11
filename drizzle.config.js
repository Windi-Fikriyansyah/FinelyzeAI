import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

console.log("DB URL:", process.env.NEXT_PUBLIC_DATABASE_URL);

export default defineConfig({
  schema: "./utils/schema.jsx",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL,
  },
});
