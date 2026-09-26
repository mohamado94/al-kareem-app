import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'alkarim_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type SessionPayload = {
  sub: string
  email: string
  displayName: string
  sessionVersion: number
}

function secretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not configured')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, displayName: payload.displayName, sessionVersion: payload.sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.sessionVersion !== 'number') return null
    return {
      sub: payload.sub,
      email: payload.email,
      displayName: typeof payload.displayName === 'string' ? payload.displayName : 'Apprenant',
      sessionVersion: payload.sessionVersion,
    }
  } catch {
    return null
  }
}

export { COOKIE_NAME, MAX_AGE }
