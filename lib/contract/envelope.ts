import { z } from "zod";
import { ErrorCodeSchema } from "./enums";

// Every API response is { ok: true, data } or { ok: false, code, message }.
export const ErrSchema = z.object({
  ok: z.literal(false),
  code: ErrorCodeSchema,
  message: z.string(),
  blockedBy: z.array(z.string()).optional(), // only for NODE_LOCKED
});
export type ApiError = z.infer<typeof ErrSchema>;

export function okSchema<T extends z.ZodType>(data: T) {
  return z.object({ ok: z.literal(true), data });
}

export function envelope<T extends z.ZodType>(data: T) {
  return z.union([okSchema(data), ErrSchema]);
}

export type ApiResult<T> = { ok: true; data: T } | ApiError;