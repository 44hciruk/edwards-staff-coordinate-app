import type { Express } from "express";

// OAuth routes are no longer used; replaced by email/password authentication.
export function registerOAuthRoutes(_app: Express): void {
  // no-op
}
