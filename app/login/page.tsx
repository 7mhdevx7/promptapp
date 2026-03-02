import LoginForm from "./LoginForm"

export default function LoginPage() {
  const showRegister = process.env.REGISTRATION_ENABLED !== "false"
  return <LoginForm showRegister={showRegister} />
}
