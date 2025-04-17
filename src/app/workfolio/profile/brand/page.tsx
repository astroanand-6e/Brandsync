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
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Save,
  ShieldCheck,
  ShieldAlert,
  FileText
} from 'lucide-react';

// Define types for the profile data
interface BrandProfileData {
  id: string;
  companyName: string;
  industry: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  verificationDoc: string | null;
  isVerified: boolean;
}

// Common industries for selection
const industries = [
  'Fashion', 'Beauty', 'Food & Beverage', 'Technology', 'Health & Wellness',
  'Travel', 'Home & Decor', 'Entertainment', 'Sports', 'Finance', 'Education', 'Sustainable Fashion'
];

export default function BrandProfileEdit() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [verificationDoc, setVerificationDoc] = useState('');
  // isVerified is display-only, not editable by users

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
        
        if (data.role !== 'BRAND') {
          router.push('/workfolio');
          return;
        }

        const profileData = data.profile as BrandProfileData;
        setProfile(profileData);

        // Initialize form state with fetched data
        setCompanyName(profileData.companyName || '');
        setIndustry(profileData.industry || '');
        setDescription(profileData.description || '');
        setWebsite(profileData.website || '');
        setLogo(profileData.logo || '');
        setCoverImage(profileData.coverImage || '');
        setVerificationDoc(profileData.verificationDoc || '');

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/profile/brand', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName,
          industry,
          description,
          website,
          logo,
          coverImage,
          verificationDoc
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update profile`);
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
      setProfile(data.profile); // Update the profile with the returned data
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || 'Failed to update profile');
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
        <h1 className="text-3xl font-bold mb-6">Edit Brand Profile</h1>
        
        {/* Cover Image Preview */}
        <div className="relative mb-10 h-48 md:h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No cover image</p>
            </div>
          )}
          
          {/* Cover image edit overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button className="bg-background/80 hover:bg-background">
              <Upload className="h-4 w-4 mr-2" /> Change Cover
            </Button>
          </div>
        </div>
        
        {/* Logo */}
        <div className="relative mx-auto -mt-20 mb-8 w-32 h-32">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={logo || undefined} alt={companyName} />
            <AvatarFallback className="text-4xl">
              {companyName?.charAt(0) || 'B'}
            </AvatarFallback>
          </Avatar>
          
          {/* Logo edit button */}
          <Button 
            size="sm" 
            className="absolute bottom-0 right-0 rounded-full p-2 h-10 w-10"
          >
            <Upload className="h-4 w-4" />
          </Button>
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
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your brand's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Name */}
              <div className="space-y-2">
                <label htmlFor="companyName" className="font-medium text-sm">
                  Company Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  required
                />
              </div>
              
              {/* Industry */}
              <div className="space-y-2">
                <label htmlFor="industry" className="font-medium text-sm">
                  Industry <span className="text-destructive">*</span>
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="" disabled>Select an industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="font-medium text-sm">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell influencers about your brand..."
                  rows={4}
                />
              </div>
              
              {/* Website */}
              <div className="space-y-2">
                <label htmlFor="website" className="font-medium text-sm">Website</label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.yourcompany.com"
                />
              </div>
              
              {/* Image URLs (for simplicity - in a real app, use file uploads) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="logo" className="font-medium text-sm">Logo URL</label>
                  <Input
                    id="logo"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-sm text-muted-foreground">Enter a URL for your company logo</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="coverImage" className="font-medium text-sm">Cover Image URL</label>
                  <Input
                    id="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-sm text-muted-foreground">Enter a URL for your cover image</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Verification Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Brand Verification</CardTitle>
                {profile?.isVerified ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Pending Verification
                  </Badge>
                )}
              </div>
              <CardDescription>
                {profile?.isVerified
                  ? "Your brand is verified. This builds trust with influencers."
                  : "Submit verification documents to confirm your brand's legitimacy."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="verificationDoc" className="font-medium text-sm">
                  Verification Document URL
                </label>
                <Input
                  id="verificationDoc"
                  value={verificationDoc}
                  onChange={(e) => setVerificationDoc(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  disabled={profile?.isVerified}
                />
                <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {profile?.isVerified
                      ? "Your brand is already verified. No further documents needed."
                      : "Provide a link to your business documents (e.g., business registration certificate). Our team will review and verify your brand."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/workfolio')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || !companyName || !industry}
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