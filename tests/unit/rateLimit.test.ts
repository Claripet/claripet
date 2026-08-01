import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/helpers/rateLimit";
import * as cloudflare from "@opennextjs/cloudflare";

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

describe("rateLimit helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows requests up to the limit using in-memory fallback when Cloudflare Context is unavailable", async () => {
    vi.mocked(cloudflare.getCloudflareContext).mockReturnValue(null as any);

    const testKey = `test_ip_${Date.now()}`;
    expect(await rateLimit(testKey, 2, 1000)).toBe(true);
    expect(await rateLimit(testKey, 2, 1000)).toBe(true);
    expect(await rateLimit(testKey, 2, 1000)).toBe(false);
  });

  it("uses Cloudflare Workers KV when RATE_LIMIT_KV binding exists in context", async () => {
    const mockStore: Record<string, string> = {};
    const mockKV = {
      get: vi.fn().mockImplementation(async (key: string, opts?: any) => {
        const val = mockStore[key];
        if (!val) return null;
        return opts?.type === "json" ? JSON.parse(val) : val;
      }),
      put: vi.fn().mockImplementation(async (key: string, value: string) => {
        mockStore[key] = value;
      }),
    };

    vi.mocked(cloudflare.getCloudflareContext).mockReturnValue({
      env: {
        RATE_LIMIT_KV: mockKV,
      },
    } as any);

    const testKey = "kv_test_ip";
    
    // 1st request - should put count=1 in KV
    expect(await rateLimit(testKey, 2, 60000)).toBe(true);
    expect(mockKV.get).toHaveBeenCalledWith(testKey, { type: "json" });
    expect(mockKV.put).toHaveBeenCalled();

    // 2nd request - should increment count to 2 in KV
    expect(await rateLimit(testKey, 2, 60000)).toBe(true);

    // 3rd request - should block (limit reached) without updating KV again
    expect(await rateLimit(testKey, 2, 60000)).toBe(false);
  });
});
