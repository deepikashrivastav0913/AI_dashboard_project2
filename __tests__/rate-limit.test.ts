import { rateLimit } from "@/lib/rate-limit"

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    expect(rateLimit("test-key-1", 3, 60_000)).toBe(true)
    expect(rateLimit("test-key-1", 3, 60_000)).toBe(true)
    expect(rateLimit("test-key-1", 3, 60_000)).toBe(true)
  })

  it("blocks requests over limit", () => {
    rateLimit("test-key-2", 2, 60_000)
    rateLimit("test-key-2", 2, 60_000)
    expect(rateLimit("test-key-2", 2, 60_000)).toBe(false)
  })

  it("uses separate buckets per key", () => {
    rateLimit("key-a", 1, 60_000)
    expect(rateLimit("key-b", 1, 60_000)).toBe(true)
  })
})
