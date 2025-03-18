import { z } from 'zod';

export const payload = z.object({
  query: z.string().min(1),
});

export const config = z.object({
  host: z.string(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
});

export const result = z.object({
  result: z.string(),
});