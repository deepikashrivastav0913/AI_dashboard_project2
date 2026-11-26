import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { PublicForm } from "@/components/forms/public-form"

describe("PublicForm phone validation", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response)
  })

  afterEach(() => {
    Reflect.deleteProperty(global, "fetch")
  })

  it("only accepts exactly 10 digits", async () => {
    render(
      <PublicForm
        formId="form-1"
        formVersionId="version-1"
        title="Contact"
        fields={[{ id: "phone-1", type: "PHONE", name: "phone", label: "Phone Number", required: true }]}
        ctaText="Submit"
        thankYouTitle="Thank you"
        thankYouBody="Received"
      />,
    )

    const phone = screen.getByLabelText(/phone number/i)
    fireEvent.change(phone, { target: { value: "abc12-345" } })
    expect((phone as HTMLInputElement).value).toBe("12345")

    fireEvent.click(screen.getByRole("button", { name: "Submit" }))
    expect(await screen.findByText("Enter a valid 10-digit phone number")).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()

    fireEvent.change(phone, { target: { value: "1234567890" } })
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  })
})
