'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Use workspace alias for import
import { StepIndicator } from '@/components/onboarding/StepIndicator';

interface OnboardingLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  userType: 'brand' | 'influencer';
}

export function OnboardingLayout({ 
  children, 
  title, 
  description, 
  currentStep, 
  totalSteps,
  userType
}: OnboardingLayoutProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Protect onboarding routes - users must be logged in
  useEffect(() => {
    // Wait until auth is loaded before redirecting
    if (!loading) {
      // If no user, redirect to sign-in
      if (!user) {
        router.push(`/signin?redirect=/onboarding/${userType}`);
        return;
      }
      
      // If user has a profile and has already completed onboarding, redirect to dashboard
      if (userProfile?.hasCompletedOnboarding) {
        router.push(userProfile.role === 'BRAND' ? '/dashboard/brand' : '/dashboard/influencer');
      }
      
      // If user has a profile but it's for a different role type, redirect to the right onboarding
      if (userProfile && !userProfile.hasCompletedOnboarding) {
        const correctUserType = userProfile.role === 'BRAND' ? 'brand' : 'influencer';
        if (correctUserType !== userType) {
          router.push(`/onboarding/${correctUserType}`);
        }
      }
    }
  }, [loading, user, userProfile, router, userType]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}