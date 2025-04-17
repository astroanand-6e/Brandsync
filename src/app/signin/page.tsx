'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('influencer'); // 'influencer' or 'brand'
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO: Redirect based on userType after sign-in logic is updated
  const redirectPath = searchParams.get('redirect') || '/discover';

  const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Pass userType to signIn function or handle role association after sign-in
      await signIn(email, password);
      // Redirect logic might need adjustment based on role
      router.push(redirectPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to sign in as ${userType}: ` + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
       // TODO: Pass userType to signInWithGoogle function or handle role association after sign-in
      await signInWithGoogle();
       // Redirect logic might need adjustment based on role
      router.push(redirectPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(`Failed to sign in with Google as ${userType}: ` + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = (type: 'influencer' | 'brand') => (
    <>
      {error && userType === type && (
        <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div className="space-y-2">
          <Input
            id={`${type}-email`}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Input
            id={`${type}-password`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || userType !== type}>
          {loading && userType === type ? 'Signing in...' : `Sign in as ${type === 'influencer' ? 'Influencer' : 'Brand'}`}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading || userType !== type}
      >
        {loading && userType === type ? 'Signing in...' : `Sign in with Google as ${type === 'influencer' ? 'Influencer' : 'Brand'}`}
      </Button>
    </>
  );


  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Choose your role and sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Tabs value={userType} onValueChange={setUserType} className="w-full">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="influencer">Influencer</TabsTrigger>
               <TabsTrigger value="brand">Brand</TabsTrigger>
             </TabsList>
             <TabsContent value="influencer" className="mt-4">
                {renderSignInForm('influencer')}
             </TabsContent>
             <TabsContent value="brand" className="mt-4">
               {renderSignInForm('brand')}
             </TabsContent>
           </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link> {/* Corrected closing tag placement */}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}