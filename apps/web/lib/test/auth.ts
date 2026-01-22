import { spyOn } from "bun:test";

export type MockSession = {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
  };
};

export type AuthSessionResponse = {
  data: MockSession | null;
  error: unknown | null;
};

export type AuthClientMock = {
  getSession: (options?: unknown) => Promise<AuthSessionResponse>;
};

export const createMockSession = (): MockSession => {
  const now = new Date();

  return {
    session: {
      id: "session-1",
      createdAt: now,
      updatedAt: now,
      userId: "user-1",
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

export const createAuthClientMock = (): AuthClientMock => ({
  getSession: async (_options?: unknown) => ({
    data: null,
    error: null,
  }),
});

export const mockAuthSession = (
  authClient: AuthClientMock,
  session: MockSession | null = createMockSession()
) =>
  spyOn(authClient, "getSession").mockResolvedValue({
    data: session,
    error: null,
  });

export const mockAuthSessionError = (
  authClient: AuthClientMock,
  error: unknown
) =>
  spyOn(authClient, "getSession").mockResolvedValue({
    data: null,
    error,
  });
