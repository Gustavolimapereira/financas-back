import 'dotenv/config';
import { z } from 'zod';

type JwtExpiration = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

const jwtExpirationSchema = z
  .string()
  .regex(/^\d+(ms|s|m|h|d|w|y)$/)
  .transform((value) => value as JwtExpiration);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: jwtExpirationSchema.default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: jwtExpirationSchema.default('7d'),
  ADMIN_NAME: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);
