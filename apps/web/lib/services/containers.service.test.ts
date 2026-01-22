import { afterEach, describe, expect, jest, test } from "bun:test";
import { mockAuthSession } from "@/lib/test/auth";
import { setupServiceMocks } from "@/lib/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, cookieStore, authClient } =
  setupServiceMocks();

const service = await import("./containers.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  jest.restoreAllMocks();
});

describe("list containers", () => {
  test("should return an empty array of containers", async () => {
    const getSessionSpy = mockAuthSession(authClient);

    apiMock.mockResolvedValue({ data: [], error: null });

    const result = await service.listContainers();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/containers", {
      method: "get",
      headers: {
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
      next: {
        tags: ["containers"],
      },
    });
    expect(result).toEqual({ data: [], error: null });
  });
});
