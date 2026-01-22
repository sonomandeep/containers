import { afterEach, describe, expect, jest, test } from "bun:test";
import type { Image, PullImageInput } from "@containers/shared";
import { mockAuthSession, mockAuthSessionError } from "@/test/auth";
import { setupServiceMocks } from "@/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, updateTagMock, cookieStore, authClient } =
  setupServiceMocks();

const service = await import("./images.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  updateTagMock.mockReset();
  jest.restoreAllMocks();
});

describe("listImages", () => {
  test("returns images when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const images: Array<Image> = [
      {
        id: "image-1",
        name: "nginx",
        tags: ["latest"],
        size: 123_456,
        layers: 3,
        os: "linux",
        architecture: "amd64",
        registry: "docker.io",
        containers: [
          {
            id: "container-1",
            name: "web",
            state: "running",
          },
        ],
      },
    ];

    apiMock.mockResolvedValue({ data: images, error: null });

    const result = await service.listImages();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/images", {
      method: "get",
      headers: {
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
      next: {
        tags: ["images"],
      },
    });
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: images, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: [], error: apiError });

    const result = await service.listImages();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while fetching images.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.listImages().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
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

    const error = await service.listImages().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });
});

describe("pullImage", () => {
  test("returns image when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input: PullImageInput = {
      registry: "docker.io",
      name: "nginx",
      tag: "latest",
    };
    const image: Image = {
      id: "image-1",
      name: "nginx",
      tags: ["latest"],
      size: 123_456,
      os: "linux",
      architecture: "amd64",
      registry: "docker.io",
      containers: [],
    };

    apiMock.mockResolvedValue({ data: image, error: null });

    const result = await service.pullImage(input);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/images", {
      method: "post",
      headers: {
        "content-type": "application/json",
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
      body: JSON.stringify(input),
    });
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: image, error: null });
  });

  test("returns validation error when input is invalid", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input: PullImageInput = {
      registry: "",
      name: "nginx",
      tag: "latest",
    };

    const result = await service.pullImage(input);

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "validation error" });
  });

  test("returns not found error when api responds with 404", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "Not Found",
      status: 404,
      statusText: "Not Found",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.pullImage({
      registry: "docker.io",
      name: "missing",
      tag: "latest",
    });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "Image not found." });
  });

  test("returns error when api responds with 500", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "Server error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.pullImage({
      registry: "docker.io",
      name: "nginx",
      tag: "latest",
    });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while downloading image.",
    });
  });

  test("returns api error message for other statuses", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      status: 400,
      statusText: "Bad Request",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.pullImage({
      registry: "docker.io",
      name: "nginx",
      tag: "latest",
    });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "Bad Request" });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service
      .pullImage({
        registry: "docker.io",
        name: "nginx",
        tag: "latest",
      })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
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
      .pullImage({
        registry: "docker.io",
        name: "nginx",
        tag: "latest",
      })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });
});

describe("removeImages", () => {
  test("returns image ids when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = ["image-1", "image-2"];

    apiMock.mockResolvedValue({ error: null });

    const result = await service.removeImages(input);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/images/remove", {
      method: "post",
      body: JSON.stringify({ images: input }),
      headers: {
        Cookie: cookieStore.toString(),
        "content-type": "application/json",
      },
    });
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: input, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ error: apiError });

    const result = await service.removeImages(["image-1"]);

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while removing images.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service
      .removeImages(["image-1"])
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
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
      .removeImages(["image-1"])
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });
});
