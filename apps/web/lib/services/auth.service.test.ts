import { afterEach, describe, expect, jest, test } from "bun:test";
import {
  createMockSession,
  mockAuthSession,
  mockAuthSessionError,
} from "@/test/auth";
import { setupServiceMocks } from "@/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { redirectMock, cookieStore, authClient } = setupServiceMocks();

const service = await import("./auth.service");

afterEach(() => {
  redirectMock.mockReset();
  jest.restoreAllMocks();
});

describe("getSession", () => {
  test("returns session data from auth", async () => {
    const session = createMockSession();
    const getSessionSpy = mockAuthSession(authClient, session);

    const result = await service.getSession();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual(session);
  });
});

describe("checkAuthentication", () => {
  test("returns session data and cookies when authenticated", async () => {
    const session = createMockSession();
    const getSessionSpy = mockAuthSession(authClient, session);

    const result = await service.checkAuthentication();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ...session, cookies: cookieStore });
  });

  test("redirects when auth session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.checkAuthentication().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.checkAuthentication().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });
});
