import { authClient } from "../auth-client";

export const isAuthenticated = async () => {
  try {
    const session = await authClient.getSession();
    if (!session) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to get session:", error);
    return false;
  }
};