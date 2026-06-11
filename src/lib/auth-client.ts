import { createAuthClient } from "better-auth/react";

// Initialize Better Auth client for authentication operations
// Provides: signIn (email/password), signUp, signOut, useSession, updateUser
export const { signIn, signUp, signOut, useSession, updateUser } =
  createAuthClient();
