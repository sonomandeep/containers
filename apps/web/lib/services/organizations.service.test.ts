import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
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

describe("getActiveOrganizationSummary", () => {
  test("returns active organization summary when auth request succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const getFullOrganizationSpy = spyOn(
      authClient.organization,
      "getFullOrganization"
    ).mockResolvedValue({
      data: {
        id: "org-1",
        name: "Acme",
        slug: "acme",
        logo: "http://localhost/logo.png",
      },
      error: null,
    });

    const result = await service.getActiveOrganizationSummary();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(getFullOrganizationSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        id: "org-1",
        name: "Acme",
        slug: "acme",
        logo: "http://localhost/logo.png",
      },
      error: null,
    });
  });

  test("returns error when active organization lookup fails", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const getFullOrganizationSpy = spyOn(
      authClient.organization,
      "getFullOrganization"
    ).mockResolvedValue({
      data: null,
      error: {
        message: "forbidden",
      },
    });

    const result = await service.getActiveOrganizationSummary();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(getFullOrganizationSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unable to load active workspace.",
    });
  });

  test("returns no active workspace message when no organization is active", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const getFullOrganizationSpy = spyOn(
      authClient.organization,
      "getFullOrganization"
    ).mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await service.getActiveOrganizationSummary();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(getFullOrganizationSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "No active workspace found.",
    });
  });

  test("returns parse error when organization payload is invalid", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const getFullOrganizationSpy = spyOn(
      authClient.organization,
      "getFullOrganization"
    ).mockResolvedValue({
      data: {
        id: "org-1",
      },
      error: null,
    });

    const result = await service.getActiveOrganizationSummary();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(getFullOrganizationSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unable to load active workspace.",
    });
  });
});

describe("listPendingJoinInvitations", () => {
  test("returns pending invitations with organization slug details", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const listInvitationsSpy = spyOn(
      authClient.organization,
      "listUserInvitations"
    ).mockResolvedValue({
      data: [{ id: "inv-1" }, { id: "inv-2" }],
      error: null,
    });

    const getInvitationSpy = spyOn(
      authClient.organization,
      "getInvitation"
    ).mockImplementation((options?: unknown) => {
      const invitationId =
        typeof options === "object" &&
        options !== null &&
        "query" in options &&
        typeof options.query === "object" &&
        options.query !== null &&
        "id" in options.query
          ? String(options.query.id)
          : "";

      if (invitationId === "inv-1") {
        return Promise.resolve({
          data: {
            id: "inv-1",
            organizationName: "Acme",
            organizationSlug: "acme",
          },
          error: null,
        });
      }

      return Promise.resolve({
        data: {
          id: "inv-2",
          organizationName: "Beta",
          organizationSlug: "beta",
        },
        error: null,
      });
    });

    const result = await service.listPendingJoinInvitations();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(listInvitationsSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(getInvitationSpy).toHaveBeenCalledTimes(2);
    expect(getInvitationSpy).toHaveBeenNthCalledWith(1, {
      query: { id: "inv-1" },
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(getInvitationSpy).toHaveBeenNthCalledWith(2, {
      query: { id: "inv-2" },
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: [
        {
          id: "inv-1",
          organizationName: "Acme",
          organizationSlug: "acme",
        },
        {
          id: "inv-2",
          organizationName: "Beta",
          organizationSlug: "beta",
        },
      ],
      error: null,
    });
  });

  test("returns error when listing pending invitations fails", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const listInvitationsSpy = spyOn(
      authClient.organization,
      "listUserInvitations"
    ).mockResolvedValue({
      data: null,
      error: {
        message: "unexpected",
      },
    });
    const getInvitationSpy = spyOn(authClient.organization, "getInvitation");

    const result = await service.listPendingJoinInvitations();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(listInvitationsSpy).toHaveBeenCalledTimes(1);
    expect(getInvitationSpy).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unable to load pending invitations.",
    });
  });

  test("returns error when pending invitations payload is invalid", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const listInvitationsSpy = spyOn(
      authClient.organization,
      "listUserInvitations"
    ).mockResolvedValue({
      data: [
        {
          noId: "inv-1",
        },
      ],
      error: null,
    });
    const getInvitationSpy = spyOn(authClient.organization, "getInvitation");

    const result = await service.listPendingJoinInvitations();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(listInvitationsSpy).toHaveBeenCalledTimes(1);
    expect(getInvitationSpy).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unable to load pending invitations.",
    });
  });

  test("skips invitations whose detail lookup fails", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const listInvitationsSpy = spyOn(
      authClient.organization,
      "listUserInvitations"
    ).mockResolvedValue({
      data: [{ id: "inv-1" }, { id: "inv-2" }],
      error: null,
    });

    const getInvitationSpy = spyOn(authClient.organization, "getInvitation")
      .mockResolvedValueOnce({
        data: null,
        error: {
          message: "not found",
        },
      })
      .mockResolvedValueOnce({
        data: {
          id: "inv-2",
          organizationName: "Beta",
          organizationSlug: "beta",
        },
        error: null,
      });

    const result = await service.listPendingJoinInvitations();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(listInvitationsSpy).toHaveBeenCalledTimes(1);
    expect(getInvitationSpy).toHaveBeenCalledTimes(2);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: [
        {
          id: "inv-2",
          organizationName: "Beta",
          organizationSlug: "beta",
        },
      ],
      error: null,
    });
  });
});
