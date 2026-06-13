/**
 * backend-config.example.ts — Template for backend-config.ts
 * ────────────────────────────────────────────────────────────
 * Copy this file to backend-config.ts and fill in your values.
 * backend-config.ts is listed in .gitignore and must never be committed.
 */

export const backendConfig = {
  /** Base URL of the Flask backend */
  baseUrl: 'http://localhost:5001',

  /**
   * Fallback API key — used as Bearer token when no Firebase user is signed in.
   * Copy the value of API_SECRET_KEY from medical_image_sorter/.env
   * Leave empty once you configure Firebase Admin SDK (serviceAccountKey.json).
   */
  apiSecretKey: '',
};
