'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, 
  Check, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Save
} from 'lucide-react';

// Define types for the profile data including relations
interface Niche {
  id: string;
  name: string;
}

interface ContentType {
  id: string;
  name: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string;
}

interface InfluencerProfileData {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  coverImage: string | null;
  niches: Niche[];
  contentTypes: ContentType[];
  socialAccounts?: SocialAccount[];
}

// Common niches and content types for selection
const availableNiches = [
  'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 
  'Fitness', 'Technology', 'Gaming', 'Business', 'Education'
];
const availableContentTypes = [
  'Photos', 'Videos', 'Reels', 'Stories', 'Live Streams',
  'Blog Posts', 'Reviews', 'Tutorials', 'Unboxing'
];

export default function InfluencerProfileEdit() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<InfluencerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      setError('');
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/profile/details', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch profile`);
        }

        const data = await response.json();
        
        if (data.role !== 'INFLUENCER') {
          router.push('/workfolio');
          return;
        }

        const profileData = data.profile as InfluencerProfileData;
        setProfile(profileData);

        // Initialize form state with fetched data
        setFirstName(profileData.firstName || '');
        setLastName(profileData.lastName || '');
        setBio(profileData.bio || '');
        setLocation(profileData.location || '');
        setWebsite(profileData.website || '');
        setAvatar(profileData.avatar || '');
        setCoverImage(profileData.coverImage || '');
        setSelectedNiches(profileData.niches.map(niche => niche.name));
        setSelectedContentTypes(profileData.contentTypes.map(type => type.name));

      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else {
        fetchProfile();
      }
    }
  }, [user, authLoading, router]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    // Basic validation before saving
    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }
     if (selectedNiches.length === 0) {
      setError('Please select at least one niche.');
      return;
    }
     if (selectedContentTypes.length === 0) {
      setError('Please select at least one content type.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/profile/influencer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          bio,
          location,
          website,
          avatar, // Include avatar URL from state
          coverImage, // Include coverImage URL from state
          niches: selectedNiches,
          contentTypes: selectedContentTypes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success' || !data.profile) {
         throw new Error("Failed to update profile: Invalid response from server.");
      }
      
      setSuccess('Profile updated successfully!');
      // Update local state with the response profile data to ensure consistency
      const updatedProfile = data.profile as InfluencerProfileData;
      setProfile(updatedProfile);
      setFirstName(updatedProfile.firstName || '');
      setLastName(updatedProfile.lastName || '');
      setBio(updatedProfile.bio || '');
      setLocation(updatedProfile.location || '');
      setWebsite(updatedProfile.website || '');
      setAvatar(updatedProfile.avatar || '');
      setCoverImage(updatedProfile.coverImage || '');
      setSelectedNiches(updatedProfile.niches.map(niche => niche.name));
      setSelectedContentTypes(updatedProfile.contentTypes.map(type => type.name));
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || 'Failed to update profile');
       // Auto-clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold mb-2">Error Loading Profile</h1>
        <p className="text-center text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push('/workfolio')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portfolio
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.push('/workfolio')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Portfolio
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
        
        {/* Cover Image Preview */}
        <div className="relative mb-10 h-48 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No cover image</p>
            </div>
          )}
          
          {/* Cover image edit overlay - Consider implementing file upload later */}
          {/* <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button className="bg-background/80 hover:bg-background">
              <Upload className="h-4 w-4 mr-2" /> Change Cover
            </Button>
          </div> */}
        </div>
        
        {/* Avatar */}
        <div className="relative mx-auto -mt-20 mb-8 w-32 h-32">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={avatar || undefined} alt={`${firstName} ${lastName}`} />
            <AvatarFallback className="text-4xl">
              {firstName?.charAt(0) || ''}{lastName?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          
          {/* Avatar edit button - Consider implementing file upload later */}
          {/* <Button 
            size="sm" 
            className="absolute bottom-0 right-0 rounded-full p-2 h-10 w-10"
          >
            <Upload className="h-4 w-4" />
          </Button> */}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Display any errors or success messages */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 p-4 rounded-md flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="font-medium text-sm">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="font-medium text-sm">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
              
              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="font-medium text-sm">Bio</label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell brands about yourself..."
                  rows={4}
                />
              </div>
              
              {/* Location and Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="font-medium text-sm">Location</label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="website" className="font-medium text-sm">Website / Portfolio</label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
              
              {/* Image URLs (for simplicity - in a real app, use file uploads) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="avatar" className="font-medium text-sm">Profile Image URL</label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    type="url" // Use URL type for basic validation
                  />
                  <p className="text-sm text-muted-foreground">Enter a URL for your profile image</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="coverImage" className="font-medium text-sm">Cover Image URL</label>
                  <Input
                    id="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    type="url" // Use URL type for basic validation
                  />
                  <p className="text-sm text-muted-foreground">Enter a URL for your cover image</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Niches and Content Types */}
          <Card>
            <CardHeader>
              <CardTitle>Content Specialization</CardTitle>
              <CardDescription>Select your niches and content types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Niches */}
              <div className="space-y-3">
                <label className="font-medium text-sm block">Your Niches</label>
                <div className="flex flex-wrap gap-2">
                  {availableNiches.map((niche) => (
                    <Badge
                      key={niche}
                      variant={selectedNiches.includes(niche) ? "default" : "outline"}
                      className="cursor-pointer py-1.5 px-3 hover:bg-muted transition-colors" // Add hover effect
                      onClick={() => toggleNiche(niche)}
                    >
                      {selectedNiches.includes(niche) && (
                        <Check className="mr-1 h-3.5 w-3.5" />
                      )}
                      {niche}
                    </Badge>
                  ))}
                </div>
                {/* Validation message moved near submit button or handled in handleSubmit */}
              </div>
              
              {/* Content Types */}
              <div className="space-y-3">
                <label className="font-medium text-sm block">Content Types You Create</label>
                <div className="flex flex-wrap gap-2">
                  {availableContentTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedContentTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer py-1.5 px-3 hover:bg-muted transition-colors" // Add hover effect
                      onClick={() => toggleContentType(type)}
                    >
                      {selectedContentTypes.includes(type) && (
                        <Check className="mr-1 h-3.5 w-3.5" />
                      )}
                      {type}
                    </Badge>
                  ))}
                </div>
                 {/* Validation message moved near submit button or handled in handleSubmit */}
              </div>
            </CardContent>
          </Card>
          
          {/* Social Accounts - Placeholder for future implementation */}
          <Card>
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
              <CardDescription>Link your social media profiles</CardDescription>
              {/* Remove the non-functional "Connect Account" button if it exists */}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Social account linking coming soon!</p>
              {/* Placeholder UI */}
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/workfolio')}>
              Cancel
            </Button>
            <Button 
              type="submit" // Ensure this is type="submit" to trigger form onSubmit
              disabled={saving} // Disable only while saving
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}