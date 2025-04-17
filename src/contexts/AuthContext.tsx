'use client'; // This directive is necessary for Context API in App Router

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword as firebaseSignUp, 
  signInWithEmailAndPassword as firebaseSignIn,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, // Add this import
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { setCookie, deleteCookie } from 'cookies-next';
import { UserRole } from '@/generated/prisma';
import { useRouter } from 'next/navigation';

// Keep UserProfile type definition or import from a shared types file if moved
export interface UserProfile {
  hasCompletedOnboarding: boolean;
  role: UserRole;
  id?: string;
  brandId?: string;
  influencerId?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: (role?: UserRole) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile data from API endpoint
  const fetchUserProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setUserProfile(null);
      return;
    }
    
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Handle errors, e.g., token expired, user not found server-side
        console.error('Failed to fetch user profile:', response.statusText);
        if (response.status === 401) {
          // Token might be invalid/expired, attempt sign out
          await signOut(); 
        }
        setUserProfile(null);
        return;
      }

      const profile: UserProfile | null = await response.json();
      setUserProfile(profile);

      // If profile is null, it means user exists in Firebase but not in our database
      // Redirect to signup to complete registration
      if (profile === null) {
        console.log('User exists in Firebase but not in database, redirecting to signup');
        router.push('/signup');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Function to refresh user profile (called after onboarding completes)
  const refreshUserProfile = async () => {
    await fetchUserProfile(user);
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // User is signed in
        const token = await currentUser.getIdToken();
        // Set auth cookie for server-side route protection (middleware)
        setCookie('authToken', token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Fetch the user profile
        await fetchUserProfile(currentUser);
      } else {
        // User is signed out
        deleteCookie('authToken');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, role: UserRole): Promise<UserCredential> => {
    const credential = await firebaseSignUp(auth, email, password);
    
    // Create the user in our database
    if (credential.user) {
      try {
        const token = await credential.user.getIdToken();
        // Call the API endpoint to create the user record
        const response = await fetch('/api/user/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          // Handle creation error (e.g., user already exists)
          console.error('Failed to create user record:', response.statusText);
          // Optionally sign the user out if creation failed critically
          // await signOut(); 
          throw new Error('Failed to create user record on server');
        }
        // User record created successfully, fetch profile
        await fetchUserProfile(credential.user);
      } catch (error) {
        console.error('Error during server-side user creation:', error);
        // Optionally sign the user out
        // await signOut();
        throw error; // Re-throw the error to be handled by the caller
      }
    }
    
    return credential;
  };

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    const credential = await firebaseSignIn(auth, email, password);
    // Profile will be fetched by the onAuthStateChanged listener
    // await fetchUserProfile(credential.user); // No longer needed here
    return credential;
  };

  const signInWithGoogle = async (role?: UserRole): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    
    if (credential.user) {
       try {
        const token = await credential.user.getIdToken();
        // Check if user profile exists via API
        const profileResponse = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        let profileExists = false;
        if (profileResponse.ok) {
            const existingProfile = await profileResponse.json();
            if (existingProfile) {
                profileExists = true;
                setUserProfile(existingProfile); // Update profile state immediately
            }
        }

        // If it's a sign-up (role provided) AND the profile doesn't exist yet, create it
        if (role && !profileExists) {
          const createResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          });

          if (!createResponse.ok) {
            console.error('Failed to create user record via Google Sign-In:', createResponse.statusText);
            throw new Error('Failed to create user record on server during Google Sign-In');
          }
           // Fetch profile again after creation
           await fetchUserProfile(credential.user);
        } else if (!profileExists && !role) {
            // User signed in with Google but doesn't exist in our DB and no role provided
            // This might indicate an issue or a flow where the user needs to select a role
            console.warn('Google Sign-In: User exists in Firebase but not in DB. Role selection might be needed.');
            // Decide how to handle this - maybe redirect to role selection?
            setUserProfile(null); 
        }
        // If profile already existed, it was set above or will be set by onAuthStateChanged

      } catch (error) {
        console.error('Error during Google Sign-In server-side check/creation:', error);
        // Optionally sign the user out
        // await signOut();
        throw error; // Re-throw the error
      }
    }
    
    return credential;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // State updates (user, userProfile) and cookie deletion 
      // are handled by the onAuthStateChanged listener
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      // Ensure loading is set to false even if listener hasn't fired yet
      // Though usually the listener is very fast.
      setLoading(false); 
    } 
  };

  // Add the password reset function
  const resetPassword = async (email: string): Promise<void> => {
    await firebaseSendPasswordResetEmail(auth, email);
    // Optionally, add user feedback here (e.g., show a success message)
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshUserProfile,
    resetPassword, // Add this line
  };

  // Don't render children until loading is complete to avoid rendering flashes
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};