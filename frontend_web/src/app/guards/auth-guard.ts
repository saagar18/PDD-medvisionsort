/**
 * auth-guard.ts — Route Activation Guard
 * ───────────────────────────────────────
 * VULN-11 / VULN-12 FIX:
 *
 * Old approach (insecure):
 *   authService.isLoggedIn()  →  synchronous, could be true based on
 *   localStorage before Firebase confirmed the session.
 *
 * New approach (secure):
 *   Consult Firebase authState directly via a one-shot observable.
 *   The guard waits for Firebase to respond before allowing or blocking
 *   navigation, eliminating the localStorage shimming window.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as FireAuth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const fireAuth = inject(FireAuth);

  // authState emits once with the current user (or null) and completes.
  // `take(1)` ensures we don't leave a dangling subscription.
  return authState(fireAuth).pipe(
    take(1),
    map((user) => {
      if (user) {
        return true;
      }
      // Not authenticated — redirect to login
      router.navigate(['/login']);
      return false;
    })
  );
};
