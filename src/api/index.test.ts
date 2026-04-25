import { describe, it, expect, vi, beforeEach } from "vitest";

const API_BASE = "http://localhost:3000";

vi.stubGlobal("fetch", vi.fn());
vi.stubEnv("VITE_API_BASE_URL", API_BASE);

function mockResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Promise.resolve(
    new Response(status === 204 ? null : JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...headers },
    }),
  );
}

describe("api", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let api: typeof import("./index");
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset modules so the cached csrfToken is cleared between tests
    vi.resetModules();
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    api = await import("./index");
  });

  describe("login", () => {
    it("POSTs to /login and returns a user", async () => {
      const user = {
        id: 1,
        email_address: "a@b.com",
        created_at: "",
        updated_at: "",
      };
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" })) // CSRF fetch
        .mockResolvedValueOnce(mockResponse(user));

      const result = await api.login("a@b.com", "secret");
      expect(result).toEqual(user);

      const [, loginCall] = mockFetch.mock.calls;
      expect(loginCall[0]).toContain("/login");
      expect(loginCall[1].method).toBe("POST");
      const body = JSON.parse(loginCall[1].body as string);
      expect(body).toEqual({ email_address: "a@b.com", password: "secret" });
    });

    it("throws when the response is not ok", async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" }))
        .mockResolvedValueOnce(mockResponse({ message: "Unauthorized" }, 401));

      await expect(api.login("bad@bad.com", "wrong")).rejects.toThrow(
        "Unauthorized",
      );
    });
  });

  describe("getCurrentUser", () => {
    it("GETs /session and returns a user", async () => {
      const user = {
        id: 2,
        email_address: "c@d.com",
        created_at: "",
        updated_at: "",
      };
      mockFetch.mockResolvedValueOnce(mockResponse(user));

      const result = await api.getCurrentUser();
      expect(result).toEqual(user);
      expect(mockFetch.mock.calls[0][0]).toContain("/session");
      expect(mockFetch.mock.calls[0][1].method).toBeUndefined(); // GET (default)
    });
  });

  describe("logout", () => {
    it("DELETEs /session", async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" }))
        .mockResolvedValueOnce(mockResponse(null, 204));

      await api.logout();
      const [, logoutCall] = mockFetch.mock.calls;
      expect(logoutCall[0]).toContain("/session");
      expect(logoutCall[1].method).toBe("DELETE");
    });
  });

  describe("getPlants", () => {
    it("GETs /plants and returns an array", async () => {
      const plants = [{ id: 1, name: "Orchid" }];
      mockFetch.mockResolvedValueOnce(mockResponse(plants));

      const result = await api.getPlants();
      expect(result).toEqual(plants);
    });
  });

  describe("createPlant", () => {
    it("POSTs to /plants with wrapped body", async () => {
      const plant = { id: 10, name: "New Plant" };
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" }))
        .mockResolvedValueOnce(mockResponse(plant));

      const result = await api.createPlant({ name: "New Plant" });
      expect(result).toEqual(plant);

      const [, createCall] = mockFetch.mock.calls;
      expect(createCall[0]).toContain("/plants");
      expect(createCall[1].method).toBe("POST");
      const body = JSON.parse(createCall[1].body as string);
      expect(body).toEqual({ plant: { name: "New Plant" } });
    });
  });

  describe("updatePlant", () => {
    it("PATCHes /plants/:id with wrapped body", async () => {
      const updated = { id: 5, name: "Updated" };
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" }))
        .mockResolvedValueOnce(mockResponse(updated));

      const result = await api.updatePlant(5, { name: "Updated" });
      expect(result).toEqual(updated);

      const [, patchCall] = mockFetch.mock.calls;
      expect(patchCall[0]).toContain("/plants/5");
      expect(patchCall[1].method).toBe("PATCH");
    });
  });

  describe("deletePlant", () => {
    it("DELETEs /plants/:id", async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ csrf_token: "tok" }))
        .mockResolvedValueOnce(mockResponse(null, 204));

      await api.deletePlant(3);
      const [, deleteCall] = mockFetch.mock.calls;
      expect(deleteCall[0]).toContain("/plants/3");
      expect(deleteCall[1].method).toBe("DELETE");
    });
  });
});
