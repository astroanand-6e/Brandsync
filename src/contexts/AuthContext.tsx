'use client'; // This directive is necessary for Context API in App Router

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword as firebaseSignUp, 
  signInWithEmailAndPassword as firebaseSignIn,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { setCookie, deleteCookie } from 'cookies-next';
import { userRoleEnum } from '@/db/schema'; // Import the enum from Drizzle schema
import { useRouter, usePathname } from 'next/navigation';

// Define UserRole type based on the Drizzle enum
type UserRole = typeof userRoleEnum.enumValues[number];

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
  signIn: (email: string, password: string, role?: UserRole) => Promise<UserCredential>;
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
  const pathname = usePathname(); // Get current path

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
      console.log('AuthContext: Setting userProfile state:', profile);
      setUserProfile(profile);

      // If profile is null, it means user exists in Firebase but not in our database
      // This is an error state, log it. Don't redirect to signup.
      if (profile === null) {
        console.error('Error: User exists in Firebase Auth but profile data is missing in the database.');
        // Optionally sign out the user or show an error message
        // await signOut(); 
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Function to refresh user profile (called after onboarding completes)
  const refreshUserProfile = async () => {
    // Add a small delay to allow database updates to propagate if needed
    await new Promise(resolve => setTimeout(resolve, 500)); 
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
  }, []); // Keep dependencies as they are

  // Effect for handling redirection based on auth state and profile
  useEffect(() => {
    if (!loading && user && userProfile) {
      const role = userProfile.role.toLowerCase(); // 'influencer' or 'brand'
      const isOnboardingComplete = userProfile.hasCompletedOnboarding;
      const onboardingPath = `/onboarding/${role}`;
      const dashboardPath = `/dashboard/${role}`;
      const authPaths = ['/signin', '/signup'];
      
      // Enhanced handling for protected routes
      const isProtectedRoute = 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/workfolio') || 
        pathname.startsWith('/discover') ||
        pathname.startsWith('/messages');
        
      // Handle onboarding state
      if (!isOnboardingComplete) {
        // If onboarding is not complete, strictly enforce redirect to onboarding
        // Allow only the correct onboarding path for their role
        if (pathname !== onboardingPath) {
          console.log(`Enforcing onboarding redirect: ${onboardingPath}`);
          router.push(onboardingPath);
          return; // Exit early to prevent further redirects
        }
      } else if (isOnboardingComplete) {
        // If onboarding IS complete:
        // 1. Redirect away from auth pages to dashboard
        if (authPaths.includes(pathname)) {
          console.log(`Auth page redirect to dashboard: ${dashboardPath}`);
          router.push(dashboardPath);
          return;
        }
        // 2. Redirect away from onboarding pages to dashboard
        if (pathname.startsWith('/onboarding')) {
          console.log(`Onboarding page redirect to dashboard: ${dashboardPath}`);
          router.push(dashboardPath);
          return;
        }
      }
    } else if (!loading && !user) {
      // If not loading and no user, ensure they aren't stuck on protected pages
      const protectedPaths = ['/dashboard', '/onboarding', '/workfolio', '/discover', '/messages'];
      if (protectedPaths.some(p => pathname.startsWith(p))) {
        console.log('Unauthenticated user redirected to signin');
        router.push('/signin');
      }
    }
  }, [user, userProfile, loading, router, pathname]);

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

  const signIn = async (email: string, password: string, role?: UserRole): Promise<UserCredential> => {
    const credential = await firebaseSignIn(auth, email, password);
    
    // If role is provided and user exists, check if we need to create a DB record
    if (credential.user && role) {
      try {
        const token = await credential.user.getIdToken();
        
        // First check if user profile exists via API
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

        // If profile doesn't exist yet, create it with the provided role
        if (!profileExists) {
          console.log('Creating user record during email sign-in with role:', role);
          
          const createResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          });

          if (!createResponse.ok) {
            console.error('Failed to create user record during email sign-in:', createResponse.statusText);
            throw new Error('Failed to create user record on server');
          }
          
          // Fetch profile again after creation
          await fetchUserProfile(credential.user);
        }
      } catch (error) {
        console.error('Error during email sign-in server-side check/creation:', error);
        throw error; // Re-throw the error to be handled by the caller
      }
    } else {
      // No role provided or no user, simply fetch the profile
      await fetchUserProfile(credential.user);
    }
    
    return credential;
  };

  const signInWithGoogle = async (role?: UserRole): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    
    if (credential.user) {
      try {
        const token = await credential.user.getIdToken();
        
        // First check if user profile exists via API - with retry logic
        let profileExists = false;
        let existingProfile = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            const profileResponse = await fetch('/api/user/profile', {
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (profileResponse.ok) {
              existingProfile = await profileResponse.json();
              if (existingProfile) {
                profileExists = true;
                setUserProfile(existingProfile); // Update profile state immediately
                break; // Exit the retry loop if successful
              }
            }
            break; // If response is ok but profile is null, no need to retry
          } catch (error) {
            console.log(`Attempt ${attempts + 1}/${maxAttempts} to fetch profile failed:`, error);
            attempts++;
            if (attempts < maxAttempts) {
              // Wait before retrying with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
            }
          }
        }

        // If it's a sign-up (role provided) AND the profile doesn't exist yet, create it
        if (role && !profileExists) {
          console.log('Creating user record during Google sign-in with role:', role);
          
          // Important: Don't send the token in the body, only in the Authorization header
          const createResponse = await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          });
          
          // Handle non-200 responses and check for specific error types
          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            console.error('Failed to create user record via Google Sign-In:', createResponse.statusText, errorData);
            
            // Special case: 409 Conflict usually means the user already exists
            if (createResponse.status === 409) {
              console.log('User record already exists, attempting to refresh profile');
              // Try to fetch the profile one more time
              await fetchUserProfile(credential.user);
              return credential; // Return early since the user exists
            }
            
            throw new Error(`Failed to create user record: ${errorData.error || createResponse.statusText}`);
          }
          
          // Fetch profile again after successful creation
          await fetchUserProfile(credential.user);
        } else if (!profileExists && !role) {
          // User signed in with Google but doesn't exist in our DB and no role provided
          console.warn('Google Sign-In: User exists in Firebase but not in DB. Role selection might be needed.');
          setUserProfile(null);
        }
        
      } catch (error) {
        console.error('Error during Google Sign-In server-side check/creation:', error);
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