import bcrypt from 'bcryptjs'

const ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function validatePassword(password: string): string | null {
  const bytes = new TextEncoder().encode(password).length
  if (password.length < 10 || bytes > 72) return 'auth.error.weakPassword'
  return null
}
