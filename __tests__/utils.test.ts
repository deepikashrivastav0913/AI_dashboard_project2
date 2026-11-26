import { slugify, toCSV, formatDate } from "@/lib/utils"

describe("slugify", () => {
  it("converts to lowercase with hyphens", () => expect(slugify("BMW iX3 Test Drive")).toBe("bmw-ix3-test-drive"))
  it("removes leading/trailing hyphens", () => expect(slugify("  hello world  ")).toBe("hello-world"))
  it("handles special characters", () => expect(slugify("Form & Survey!")).toBe("form-survey"))
})

describe("toCSV", () => {
  it("returns empty string for empty array", () => expect(toCSV([])).toBe(""))
  it("generates correct CSV", () => {
    const csv = toCSV([{ name: "John", email: "john@test.com" }])
    expect(csv).toContain("name,email")
    expect(csv).toContain('"John"')
  })
})

describe("formatDate", () => {
  it("formats date correctly", () => {
    const result = formatDate(new Date("2024-01-15"))
    expect(result).toContain("2024")
  })
})
