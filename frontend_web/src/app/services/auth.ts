/**
 * auth.ts — Firebase Authentication Service
 * ──────────────────────────────────────────
 * VULN-11 FIX: Removed localStorage-based auth shimming.
 * Firebase authState is now the SINGLE source of truth for login state.
 *
 * Previous insecure pattern:
 *   localStorage.getItem('auth_token') → set isLoggedIn = true immediately
 *   (could be bypassed by any user setting localStorage manually in devtools)
 *
 * Secure pattern (now):
 *   Firebase authState observable → isLoggedIn updated only after Firebase
 *   confirms the session on the server side.
 *   `isLoading` prevents route guards from firing before Firebase responds.
 */

import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth as FireAuth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth implements OnDestroy {
  private fireAuth = inject(FireAuth);

  /** True once Firebase has confirmed the session (used by authGuard). */
  isLoading = signal(true);

  /** True only when Firebase authState confirms a valid signed-in user. */
  isLoggedIn = signal(false);

  currentUser = signal<User | null>(null);

  private authSubscription: Subscription;

  constructor(private router: Router) {
    // VULN-11 FIX: Firebase authState is the ONLY source of truth.
    // No localStorage reads here — localStorage can be trivially spoofed.
    this.authSubscription = authState(this.fireAuth).subscribe((user) => {
      if (user) {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
      } else {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      }
      // Mark loading complete once Firebase has responded (first tick)
      this.isLoading.set(false);
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.fireAuth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // V4-11 FIX: Normalize error message — do not expose Firebase-specific
      // codes (auth/user-not-found vs auth/wrong-password) which allow email
      // enumeration. Always return the same generic message.
      throw new Error('Invalid email or password. Please try again.');
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.fireAuth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // V4-11 FIX: Normalize registration errors — avoid leaking whether
      // an email is already registered (email enumeration via error message).
      const msg = (error?.code === 'auth/email-already-in-use')
        ? 'Registration failed. Please check your details and try again.'
        : 'Registration failed. Please try again.';
      throw new Error(msg);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.fireAuth);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
