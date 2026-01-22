import { jest, mock } from "bun:test";
import { createAuthClientMock } from "@/lib/test/auth";

export type ServiceMocks = {
  apiMock: ReturnType<typeof jest.fn>;
  redirectMock: ReturnType<typeof jest.fn>;
  updateTagMock: ReturnType<typeof jest.fn>;
  cookieStore: {
    toString: () => string;
  };
  authClient: ReturnType<typeof createAuthClientMock>;
};

export const setupServiceMocks = (): ServiceMocks => {
  const apiMock = jest.fn();
  const redirectMock = jest.fn();
  const updateTagMock = jest.fn();
  const cookieStore = {
    toString: () => "session=token",
  };
  const authClient = createAuthClientMock();

  mock.module("@/lib/auth", () => ({
    auth: authClient,
  }));
  mock.module("@/lib/fetch", () => ({
    $api: apiMock,
  }));
  mock.module("next/headers", () => ({
    cookies: async () => cookieStore,
  }));
  mock.module("next/navigation", () => ({
    redirect: redirectMock,
  }));
  mock.module("next/cache", () => ({
    updateTag: updateTagMock,
  }));

  return { apiMock, redirectMock, updateTagMock, cookieStore, authClient };
};
