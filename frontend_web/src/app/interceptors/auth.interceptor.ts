/**
 * auth.interceptor.ts
 * ───────────────────
 * HTTP Interceptor — attaches an auth token to every request directed at
 * the Flask backend.
 *
 * Token selection priority:
 *  1. API key (backendConfig.apiSecretKey set) — used when the backend is
 *     running in static-key fallback mode (Firebase Admin SDK not installed).
 *     This takes priority so that a signed-in Firebase user's ID token is NOT
 *     sent to a backend that cannot verify it (would always 401).
 *  2. Firebase ID token — used when apiSecretKey is empty/unset, meaning the
 *     backend has Firebase Admin SDK active and can verify real tokens.
 *
 * Registration: app.config.ts → provideHttpClient(withInterceptors([authInterceptor]))
 */

import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { from, switchMap, catchError } from 'rxjs';
import { Auth as FireAuth, getIdToken } from '@angular/fire/auth';
import { backendConfig } from '../backend-config';

/** Only requests to this host receive an auth token. */
const BACKEND_HOST = new URL(backendConfig.baseUrl).host; // e.g. "localhost:5001"

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Only intercept backend requests — leave Firebase/Google calls unchanged
  if (!req.url.includes(BACKEND_HOST)) {
    return next(req);
  }

  // ── Priority 1: API key mode ─────────────────────────────────────────────
  // When the backend is in static-key fallback mode (Firebase Admin SDK not
  // installed), we MUST send the API key, not a Firebase ID token.
  // The backend cannot verify a Firebase ID token without firebase-admin.
  if (backendConfig.apiSecretKey) {
    return next(_withBearer(req, backendConfig.apiSecretKey));
  }

  // ── Priority 2: Firebase ID token mode ──────────────────────────────────
  // Used when apiSecretKey is cleared (Firebase Admin SDK is active on the
  // backend and can verify real short-lived Firebase ID tokens).
  const fireAuth = inject(FireAuth);
  const user = fireAuth.currentUser;

  if (user) {
    return from(getIdToken(user, /* forceRefresh */ false)).pipe(
      switchMap((token) => next(_withBearer(req, token))),
      catchError(() => next(req)) // On token fetch error, forward without header
    );
  }

  // No auth available — forward as-is (server will respond with 401)
  return next(req);
};

function _withBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
