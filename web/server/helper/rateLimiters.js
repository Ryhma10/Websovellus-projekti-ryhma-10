import rateLimit from 'express-rate-limit'
import { ipKeyGenerator } from 'express-rate-limit'

export const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 min
  max: 10,                       // enintään 10 yritystä / 15min
  standardHeaders: true,
  legacyHeaders: false,
  // avain: käyttäjätunnus jos annettu, muuten IP
  keyGenerator: (req) => req.body?.username?.toLowerCase?.() || ipKeyGenerator(req),
  message: { error: 'Too many sign-in attempts. Try again later.' }
})

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,     // 1 h
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email?.toLowerCase?.() || ipKeyGenerator(req),
  message: { error: 'Too many sign-up attempts. Try again later.' }
})
