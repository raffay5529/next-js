import { betterAuth } from "better-auth"; 
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { initializeUserBoard } from "../init-user-board";

const client = new MongoClient(process.env.MONGODB_URI!);

const db = client.db();

export const auth = betterAuth({
  baseURL: "https://taska-topaz.vercel.app",
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced: {
    disableCSRFCheck: true,
  },
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    }
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        }
      }
    }
  }
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return result;
}