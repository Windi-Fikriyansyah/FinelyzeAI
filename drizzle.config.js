export default {
    dialect: "postgresql",
    schema: "./utils/schema.jsx",
    out: "./drizzle",
    dbCredentials: {
        connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
    }
  }
  