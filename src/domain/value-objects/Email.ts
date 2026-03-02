const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalized)) {
      throw new Error("Invalid email address")
    }
    return new Email(normalized)
  }
}
