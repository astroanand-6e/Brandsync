'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

export default function BrandOnboarding() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  
  // Common industries (in a real app these might come from the database)
  const industries = [
    'Fashion', 'Beauty', 'Food & Beverage', 'Technology', 'Health & Wellness', 
    'Travel', 'Home & Decor', 'Entertainment', 'Sports', 'Finance', 'Education', 'Other'
  ];

  const handleNext = () => {
    if (step === 0) {
      // Validate basic profile info
      if (!companyName.trim()) {
        setError('Company name is required');
        return;
      }
      
      if (!industry) {
        setError('Please select an industry');
        return;
      }
    }
    
    setError('');
    setStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setStep(prevStep => Math.max(0, prevStep - 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create brand profile
      await fetch('/api/onboarding/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          companyName,
          industry,
          description,
          website
        }),
      });
      
      // Refresh the user profile to reflect completed onboarding
      await refreshUserProfile();
      
      // Redirect to the dashboard
      router.push('/dashboard/brand');
    } catch (error) {
      console.error('Error creating brand profile:', error);
      setError('Failed to create your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render different steps of the onboarding process
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="industry" className="text-sm font-medium">
                Industry
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                {industries.map((ind) => (
                  <Button
                    key={ind}
                    type="button"
                    variant={industry === ind ? "default" : "outline"}
                    onClick={() => setIndustry(ind)}
                    className="justify-start"
                  >
                    {ind}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Company Website
              </label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Company Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell influencers about your brand..."
                className="min-h-[150px]"
              />
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <h3 className="text-sm font-medium mb-2">Tips for a great brand description:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Explain what makes your brand unique</li>
                <li>Mention your target audience</li>
                <li>Describe your brand values and mission</li>
                <li>Share what kinds of collaborations you're looking for</li>
              </ul>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-xl">Brand Profile Summary</h3>
              <p className="text-muted-foreground">
                Please review your information before completing your profile
              </p>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{companyName}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{industry}</p>
              </div>
              
              {website && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{website}</p>
                </div>
              )}
              
              {description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{description}</p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      title="Complete Your Brand Profile"
      description={
        step === 0 ? "Tell us about your company" :
        step === 1 ? "Describe your brand" :
        "Review your profile"
      }
      currentStep={step}
      totalSteps={3}
      userType="brand"
    >
      {error && (
        <div className="p-3 mb-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      
      {renderStep()}
      
      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <Button variant="outline" onClick={handleBack} disabled={loading}>
            Back
          </Button>
        ) : (
          <div></div> // Empty div for spacing
        )}
        
        {step < 2 ? (
          <Button onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating Profile...' : 'Complete Profile'}
          </Button>
        )}
      </div>
    </OnboardingLayout>
  );
}