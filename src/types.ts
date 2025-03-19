import { z } from 'zod';

export const payload = z.object({
  query: z.string().min(1),
});

export const config = z.object({
  host: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
  port: z.number().optional(),
});

export const result = z.object({
  result: z.string(),
});