'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'influencer' | 'brand'>('influencer'); 
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  // Get the appropriate onboarding path based on user type
  const getOnboardingPath = () => {
    return redirect || `/onboarding/${userType}`;
  };

  const handleEmailSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // Pass the user type to the signUp function
      await signUp(email, password, userType.toUpperCase() as 'BRAND' | 'INFLUENCER');
      
      // Direct the user to the onboarding flow
      router.push(getOnboardingPath());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to create an account as ${userType}: ` + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      // Pass the user type to the signInWithGoogle function
      await signInWithGoogle(userType.toUpperCase() as 'BRAND' | 'INFLUENCER');
      
      // Note: The redirect to onboarding is handled in the signInWithGoogle function
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to sign up with Google as ${userType}: ` + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const GoogleButton = ({ type }: { type: 'brand' | 'influencer' }) => (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignUp} 
        disabled={loading && userType === type} 
        className="w-full"
      >
        {loading && userType === type ? 'Creating account...' : `Sign up with Google as ${type === 'influencer' ? 'Influencer' : 'Brand'}`}
      </Button>
    </>
  );

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Choose your role and create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* Wrap setUserType in a function for onValueChange */}
           <Tabs value={userType} onValueChange={(value) => setUserType(value as 'influencer' | 'brand')} className="w-full">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="influencer">Influencer</TabsTrigger>
               <TabsTrigger value="brand">Brand</TabsTrigger>
             </TabsList>
             <TabsContent value="influencer" className="space-y-4 pt-4">
               <p className="text-sm text-muted-foreground">
                 Create an account as an influencer to showcase your content and connect with brands
               </p>
               <GoogleButton type="influencer" />
             </TabsContent>
             <TabsContent value="brand" className="space-y-4 pt-4">
               <p className="text-sm text-muted-foreground">
                 Create an account as a brand to discover and collaborate with influencers
               </p>
               <GoogleButton type="brand" />
             </TabsContent>
           </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="confirm-password"
                placeholder="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up with Email'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-center text-muted-foreground mt-2">
            Already have an account?{' '}
            <Link href="/signin" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}