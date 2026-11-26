import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginForm } from "@/components/auth/login-form"

jest.mock("next-auth/react", () => ({ signIn: jest.fn().mockResolvedValue({ error: null }) }))
jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("shows validation errors for empty submit", async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/invalid email/i)).toBeInTheDocument())
  })

  it("shows error for invalid credentials", async () => {
    const { signIn } = require("next-auth/react")
    signIn.mockResolvedValueOnce({ error: "CredentialsSignin" })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@test.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } })
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument())
  })
})
