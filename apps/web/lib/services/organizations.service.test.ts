import { afterEach, describe, expect, jest, test } from "bun:test";
import type { StoredFile } from "@containers/shared";
import { mockAuthSession, mockAuthSessionError } from "@/test/auth";
import { setupServiceMocks } from "@/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, updateTagMock, cookieStore, authClient } =
  setupServiceMocks();

const service = await import("./organizations.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  updateTagMock.mockReset();
  jest.restoreAllMocks();
});

function createLogoFile() {
  return new File(["logo"], "logo.png", { type: "image/png" });
}

describe("uploadLogo", () => {
  test("uploads logo and returns stored file when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = createLogoFile();
    const uploadedFile: StoredFile = {
      id: "file-1",
      name: "logo.png",
      mimeType: "image/png",
      size: 4,
      storageKey: "logo-key",
      url: "http://localhost:8080/uploads/logo-key",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    apiMock.mockResolvedValue({ data: uploadedFile, error: null });

    const result = await service.uploadLogo(input);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/files", {
      method: "post",
      body: expect.any(FormData),
      headers: {
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
    });

    const fetchOptions = apiMock.mock.calls.at(0)?.[1];
    expect(fetchOptions).toBeDefined();
    if (fetchOptions) {
      const body = fetchOptions.body;
      expect(body).toBeInstanceOf(FormData);
      if (body instanceof FormData) {
        const file = body.get("file");
        expect(file).toBeInstanceOf(File);
        if (file instanceof File) {
          expect(file.name).toBe(input.name);
          expect(file.type).toBe(input.type);
          expect(file.size).toBe(input.size);
        }
      }
    }

    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: uploadedFile, error: null });
  });

  test("returns invalid file error on 400", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = createLogoFile();

    apiMock.mockResolvedValue({
      data: null,
      error: {
        message: "File is required.",
        status: 400,
        statusText: "Bad Request",
      },
    });

    const result = await service.uploadLogo(input);

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "Invalid logo file." });
  });

  test("returns upload error on 500", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = createLogoFile();

    apiMock.mockResolvedValue({
      data: null,
      error: {
        message: "Internal Server Error",
        status: 500,
        statusText: "Internal Server Error",
      },
    });

    const result = await service.uploadLogo(input);

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while uploading logo.",
    });
  });

  test("returns api status text for non-mapped errors", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = createLogoFile();

    apiMock.mockResolvedValue({
      data: null,
      error: {
        status: 403,
        statusText: "Forbidden",
      },
    });

    const result = await service.uploadLogo(input);

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "Forbidden" });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service
      .uploadLogo(createLogoFile())
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service
      .uploadLogo(createLogoFile())
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});

describe("removeLogo", () => {
  test("removes uploaded logo when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const fileId = "file/with space";

    apiMock.mockResolvedValue({ error: null });

    const result = await service.removeLogo(fileId);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/files/file%2Fwith%20space", {
      method: "delete",
      headers: {
        Cookie: cookieStore.toString(),
      },
    });
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: null });
  });

  test("treats missing file as already removed", async () => {
    const getSessionSpy = mockAuthSession(authClient);

    apiMock.mockResolvedValue({
      error: {
        message: "Not Found",
        status: 404,
        statusText: "Not Found",
      },
    });

    const result = await service.removeLogo("file-1");

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: null });
  });

  test("returns cleanup error on 500", async () => {
    const getSessionSpy = mockAuthSession(authClient);

    apiMock.mockResolvedValue({
      error: {
        message: "Internal Server Error",
        status: 500,
        statusText: "Internal Server Error",
      },
    });

    const result = await service.removeLogo("file-1");

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while removing uploaded logo.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.removeLogo("file-1").catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.removeLogo("file-1").catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});
