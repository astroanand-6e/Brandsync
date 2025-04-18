import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';

let isInitialized = false;
let initializationError: Error | null = null;

function initializeFirebaseAdmin() {
  // Prevent re-initialization attempts after a definitive success or known failure state
  if (isInitialized || initializationError) {
    // console.log(`Firebase Admin Init Check: Already initialized (${isInitialized}) or failed previously.`);
    return;
  }

  // Check if already initialized by Firebase itself (e.g., multiple module loads)
  if (admin.apps.length > 0) {
      console.log('Firebase Admin Init Check: admin.apps.length > 0, skipping initialization.');
      isInitialized = true;
      return;
  }

  console.log('--- Attempting Firebase Admin Initialization ---');

  // --- Load and Log Credentials ---
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = privateKeyEnv ? privateKeyEnv.replace(/\\n/g, '\n') : undefined;

  console.log(`ENV Project ID: [${typeof projectId}] ${projectId}`);
  console.log(`ENV Client Email: [${typeof clientEmail}] ${clientEmail}`);
  console.log(`ENV Private Key Set: ${!!privateKeyEnv}`);
  // Log a small, safe part of the key to ensure it's being read
  if (privateKey) {
      console.log(`Private Key Snippet (start): ${privateKey.substring(0, 35)}...`);
      console.log(`Private Key Snippet (end): ...${privateKey.substring(privateKey.length - 35)}`);
  }
  console.log('--- End Credential Log ---');
  // --- End Load and Log ---


  if (!projectId || !clientEmail || !privateKey) {
    const errMsg = 'FIREBASE ADMIN SDK INIT ERROR: Missing critical environment variables.';
    console.error(errMsg);
    initializationError = new Error(errMsg); // Store error to prevent retries
    // Do NOT set isInitialized = true
    return; // Stop initialization
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
    isInitialized = true; // Set flag ONLY on success
    initializationError = null; // Clear any previous error state if somehow retried
  } catch (error: any) {
    console.error('FIREBASE ADMIN SDK INITIALIZATION FAILED:', error.stack);
    initializationError = error; // Store the error
    // Do NOT set isInitialized = true
  }
}

// Initialize on module load attempt
initializeFirebaseAdmin();

// --- Safe Getter for Auth ---
function getAdminAuth(): Auth {
  // Re-check initialization status on every call to getAuth
  if (!isInitialized || admin.apps.length === 0) {
    // Log the state if called when not initialized
     console.error(`getAdminAuth ERROR: Attempted to get auth instance but SDK is not initialized (isInitialized: ${isInitialized}, admin.apps.length: ${admin.apps.length}).`);
     if (initializationError) {
        console.error("Initialization previously failed with:", initializationError.message);
        throw initializationError; // Re-throw the original error
     }
    // If no specific error was stored, throw a generic one
    throw new Error("Firebase Admin SDK is not initialized. Check server startup logs.");
  }
  return admin.auth();
}

// Export the getter function
export const auth = getAdminAuth();