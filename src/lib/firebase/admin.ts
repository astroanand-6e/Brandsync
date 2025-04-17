import * as admin from 'firebase-admin';

// Handle the private key format properly
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

// Check if necessary environment variables are available
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error('Missing Firebase Admin SDK environment variables. Check your .env file.');
}

// Initialize the admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
  }
}

// Export the auth service
export const auth = admin.auth();
