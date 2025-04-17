'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { prisma } from '@/lib/prisma';

export default function InfluencerOnboarding() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  
  // Step 2: Content type and niches
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  
  // Common niches/content types (in a real app these might come from the database)
  const availableNiches = [
    'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 
    'Fitness', 'Technology', 'Gaming', 'Business', 'Education'
  ];
  
  const availableContentTypes = [
    'Photos', 'Videos', 'Reels', 'Stories', 'Live Streams',
    'Blog Posts', 'Reviews', 'Tutorials', 'Unboxing'
  ];

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) 
        ? prev.filter(n => n !== niche) 
        : [...prev, niche]
    );
  };

  const toggleContentType = (type: string) => {
    setSelectedContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate basic profile info
      if (!firstName.trim() || !lastName.trim()) {
        setError('First name and last name are required');
        return;
      }
    } else if (step === 1) {
      // Validate niches and content types
      if (selectedNiches.length === 0) {
        setError('Please select at least one niche');
        return;
      }
      
      if (selectedContentTypes.length === 0) {
        setError('Please select at least one content type');
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
      // Create influencer profile
      await fetch('/api/onboarding/influencer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          firstName,
          lastName,
          bio,
          location,
          website,
          niches: selectedNiches,
          contentTypes: selectedContentTypes
        }),
      });
      
      // Refresh the user profile to reflect completed onboarding
      await refreshUserProfile();
      
      // Redirect to the dashboard
      router.push('/dashboard/influencer');
    } catch (error) {
      console.error('Error creating influencer profile:', error);
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell brands about yourself..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="New York, USA"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website / Portfolio (optional)
              </label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block mb-3">
                Select your niches (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableNiches.map((niche) => (
                  <Button
                    key={niche}
                    type="button"
                    variant={selectedNiches.includes(niche) ? "default" : "outline"}
                    onClick={() => toggleNiche(niche)}
                    className="justify-start"
                  >
                    {niche}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium block mb-3">
                Content types you create (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableContentTypes.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedContentTypes.includes(type) ? "default" : "outline"}
                    onClick={() => toggleContentType(type)}
                    className="justify-start"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-xl">Profile Summary</h3>
              <p className="text-muted-foreground">
                Please review your information before completing your profile
              </p>
            </div>
            
            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{firstName} {lastName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{location || 'Not specified'}</p>
                </div>
              </div>
              
              {bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p>{bio}</p>
                </div>
              )}
              
              {website && (
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{website}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Niches</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNiches.map(niche => (
                    <span key={niche} className="px-2 py-1 bg-secondary text-xs rounded-full">
                      {niche}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Content Types</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedContentTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-secondary text-xs rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      title="Complete Your Influencer Profile"
      description={
        step === 0 ? "Tell us about yourself" :
        step === 1 ? "What content do you create?" :
        "Review your profile"
      }
      currentStep={step}
      totalSteps={3}
      userType="influencer"
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