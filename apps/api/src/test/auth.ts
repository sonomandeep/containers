import { spyOn } from "bun:test";
import { auth as authClient } from "@/lib/auth";

export const createMockSession = () => {
  const now = new Date();

  return {
    session: {
      id: "session-1",
      createdAt: now,
      updatedAt: now,
      userId: "user-1",
      activeOrganizationId: "org-1",
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      token: "token-1",
    },
    user: {
      id: "user-1",
      createdAt: now,
      updatedAt: now,
      email: "test@example.com",
      emailVerified: true,
      name: "Test User",
    },
  };
};

export const mockAuthSession = (session = createMockSession()) =>
  spyOn(authClient.api, "getSession").mockResolvedValue(session);
