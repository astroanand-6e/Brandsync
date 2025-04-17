"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FadeUp, BlurIn } from "@/components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Briefcase, 
  Search, 
  Check, 
  CheckCircle2, 
  Hourglass, 
  X, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Upload
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Corrected Prisma type imports - Assuming '@/' maps to 'src/'
import { Influencer, Niche, ContentType } from "@/generated/prisma"; 

// Mock data for pending tasks
const pendingTasks = [
  {
    id: 1,
    brand: "Fashion Brand",
    brandLogo: "/placeholder.svg",
    title: "Create Instagram Post for Summer Collection",
    dueDate: "2023-12-25", // Changed from 2025 to a recent date
    status: "pending",
    payment: 500,
  },
  {
    id: 2,
    brand: "Beauty Co",
    brandLogo: "/placeholder.svg",
    title: "Film YouTube Tutorial with New Skincare Line",
    dueDate: "2023-12-30", // Changed from 2025 to a recent date
    status: "pending",
    payment: 750,
  },
  {
    id: 3,
    brand: "Tech Gadgets",
    brandLogo: "/placeholder.svg",
    title: "Review New Smartphone on Social Media",
    dueDate: "2023-12-28", // Changed from 2025 to a recent date
    status: "in_progress",
    payment: 600,
  },
];

// Mock data for completed tasks
const completedTasks = [
  {
    id: 4,
    brand: "Fitness App",
    brandLogo: "/placeholder.svg",
    title: "Share Workout Experience on Instagram",
    completedDate: "2023-11-10", // Changed from 2025 to a recent date
    status: "completed",
    payment: 450,
  },
  {
    id: 5,
    brand: "Food Delivery",
    brandLogo: "/placeholder.svg",
    title: "Create Food Unboxing Video",
    completedDate: "2023-11-05", // Changed from 2025 to a recent date
    status: "completed",
    payment: 350,
  },
];

// Mock data for potential brand deals
const recommendedBrands = [
  {
    id: 1,
    name: "Eco Clothing",
    logo: "/placeholder.svg",
    industry: "Sustainable Fashion",
    match: "92% match",
    description: "Looking for influencers to promote our new eco-friendly clothing line",
  },
  {
    id: 2,
    name: "Healthy Snacks",
    logo: "/placeholder.svg",
    industry: "Food & Beverage",
    match: "88% match",
    description: "Seeking fitness and lifestyle creators to showcase our protein-rich snacks",
  },
  {
    id: 3,
    name: "Travel Gear",
    logo: "/placeholder.svg",
    industry: "Travel",
    match: "85% match",
    description: "Partnering with travel influencers to review our innovative luggage",
  },
];

// Calculate stats based on tasks
const calculateEarnings = () => {
  const pending = pendingTasks.reduce((sum, task) => sum + task.payment, 0);
  const completed = completedTasks.reduce((sum, task) => sum + task.payment, 0);
  return { pending, completed, total: pending + completed };
};

// Define Influencer Profile type including relations
type InfluencerProfile = Influencer & {
  niches: Niche[];
  contentTypes: ContentType[];
  // Add other relations if needed, e.g., socialAccounts
};

// Common niches/content types (Keep or fetch from DB)
const availableNiches = [
  'Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food', 
  'Fitness', 'Technology', 'Gaming', 'Business', 'Education'
];

const availableContentTypes = [
  'Photos', 'Videos', 'Reels', 'Stories', 'Live Streams',
  'Blog Posts', 'Reviews', 'Tutorials', 'Unboxing'
];

const InfluencerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, userProfile: authUserProfile, loading: authLoading, refreshUserProfile } = useAuth(); // Renamed userProfile to avoid conflict
  const [influencerProfile, setInfluencerProfile] = useState<InfluencerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);

  // Fetch influencer profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // Initial check remains: if auth is loaded but no user or influencerId, show error.
      // This might indicate an onboarding issue or incorrect role.
      if (!authLoading && (!user || !authUserProfile?.influencerId)) {
        setLoading(false);
        setError("Influencer profile context not found. Please ensure onboarding is complete or contact support.");
        return;
      }
      
      // If user or influencerId is available, proceed to fetch detailed profile
      if (user && authUserProfile?.influencerId) {
        setLoading(true);
        setError(null);
        try {
          const token = await user.getIdToken();
          // Use the /api/profile/details endpoint
          const response = await fetch(`/api/profile/details`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
             const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
             throw new Error(errorData.error || `Failed to fetch profile details: ${response.statusText}`);
          }

          const data = await response.json();

          // Check if the role is correct and profile exists
          if (data.role !== 'INFLUENCER' || !data.profile) {
            throw new Error("Detailed influencer profile not found or role mismatch.");
          }
          
          const profileData: InfluencerProfile = data.profile;
          setInfluencerProfile(profileData);
          // Initialize form state
          setFirstName(profileData.firstName || "");
          setLastName(profileData.lastName || "");
          setBio(profileData.bio || "");
          setLocation(profileData.location || "");
          setWebsite(profileData.website || "");
          setSelectedNiches(profileData.niches.map((n: Niche) => n.name));
          setSelectedContentTypes(profileData.contentTypes.map((ct: ContentType) => ct.name));

        } catch (err: any) {
          console.error("Error fetching influencer profile:", err);
          setError(err.message || "Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
         // Handle the case where auth is loaded, user exists, but no influencerId (redundant check, but safe)
         setLoading(false);
         setError("Influencer ID not found in user profile context.");
      }
    };
    
    // Only fetch when auth state is resolved
    if (!authLoading) { 
        fetchProfile();
    }

  }, [user, authUserProfile, authLoading]); // Dependencies remain the same

  // Handle saving profile changes
  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !influencerProfile) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const token = await user.getIdToken();
      // Use the /api/profile/influencer endpoint for PUT
      const response = await fetch(`/api/profile/influencer`, { 
        method: 'PUT', // Use PUT for updates
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
          // Pass avatar and coverImage if they are managed in state
          // avatar: currentAvatarUrl, 
          // coverImage: currentCoverImageUrl,
          niches: selectedNiches,
          contentTypes: selectedContentTypes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(errorData.error || `Failed to save profile: ${response.statusText}`);
      }

      // Expecting { status: 'success', profile: updatedProfile }
      const result = await response.json(); 
      
      if (result.status !== 'success' || !result.profile) {
         throw new Error("Failed to save profile: Invalid response from server.");
      }

      const updatedProfile: InfluencerProfile = result.profile;
      setInfluencerProfile(updatedProfile);
      // Update form state again to ensure consistency
      setFirstName(updatedProfile.firstName || "");
      setLastName(updatedProfile.lastName || "");
      setBio(updatedProfile.bio || "");
      setLocation(updatedProfile.location || "");
      setWebsite(updatedProfile.website || "");
      setSelectedNiches(updatedProfile.niches.map((n: Niche) => n.name));
      setSelectedContentTypes(updatedProfile.contentTypes.map((ct: ContentType) => ct.name));
      // Update avatar/coverImage state if managed here

      setSaveSuccess(true);
      // Optionally refresh auth context profile if needed, though this update doesn't change role/id
      // await refreshUserProfile(); 
    } catch (err: any) {
      console.error("Error saving influencer profile:", err);
      setSaveError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
      // Hide success/error message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(null);
      }, 3000); 
    }
  };

  // Toggle functions for niches and content types
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

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Loading and Error States
  if (authLoading) { // Show loading only during initial auth check
    return <div className="flex justify-center items-center min-h-screen">Authenticating...</div>;
  }
  
  if (loading) { // Show loading when fetching profile details
     return <div className="flex justify-center items-center min-h-screen">Loading profile data...</div>;
  }

  if (error) { // Show error if initial context or detail fetch failed
    return <div className="flex justify-center items-center min-h-screen text-destructive">Error: {error}</div>;
  }

  if (!influencerProfile) { // Should ideally be caught by error state, but as a fallback
    return <div className="flex justify-center items-center min-h-screen">Could not load influencer profile data.</div>;
  }

  // Calculate earnings (Keep existing function or adapt)
  const earnings = calculateEarnings(); // Assuming calculateEarnings exists and uses fetched data

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar might be in Layout, assuming it's handled */}
      <main className="flex-1 pt-24 pb-20 px-6 md:px-10">
        <div className="container max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Influencer Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your brand collaborations and track your progress
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/discover">
                  <Button className="gap-2">
                    <Search className="h-4 w-4" /> Discover Brands
                  </Button>
                </Link>
              </div>
            </div>
          </FadeUp>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* --- Overview Tab --- */}
            <TabsContent value="overview" className="space-y-8">
              <BlurIn>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Pending Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{pendingTasks.length}</div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Completed Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{completedTasks.length}</div>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">${earnings.total}</div>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </BlurIn>

              <BlurIn>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Upcoming Tasks</CardTitle>
                      <CardDescription>
                        Your pending tasks from brand collaborations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start space-x-4 rounded-md border p-4"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={task.brandLogo} alt={task.brand} />
                              <AvatarFallback>{task.brand.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{task.brand}</p>
                                <Badge variant={getDaysRemaining(task.dueDate) < 3 ? "destructive" : "outline"}>
                                  {getDaysRemaining(task.dueDate)} days left
                                </Badge>
                              </div>
                              <p className="text-base font-semibold">{task.title}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                Due: {formatDate(task.dueDate)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("tasks")}>
                        View All Tasks
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recommended Brands</CardTitle>
                      <CardDescription>
                        Brands that match your content niche and audience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendedBrands.slice(0, 3).map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-start space-x-4 rounded-md border p-4"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={brand.logo} alt={brand.name} />
                              <AvatarFallback>{brand.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{brand.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {brand.match}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{brand.industry}</p>
                              <p className="text-sm line-clamp-2">{brand.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/discover" className="w-full">
                        <Button variant="outline" className="w-full">
                          View All Brands
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>

            {/* --- Tasks Tab --- */}
            <TabsContent value="tasks" className="space-y-6">
              <BlurIn>
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Tasks</CardTitle>
                      <CardDescription>
                        Your active tasks from brand collaborations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {pendingTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start p-4 sm:p-6"
                          >
                            <Avatar className="h-12 w-12 hidden sm:flex mr-4">
                              <AvatarImage src={task.brandLogo} alt={task.brand} />
                              <AvatarFallback>{task.brand.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">{task.brand}</p>
                                  <p className="text-base font-semibold">{task.title}</p>
                                </div>
                                <Badge 
                                  variant={task.status === 'in_progress' ? 'default' : 'outline'}
                                  className="ml-2"
                                >
                                  {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    <span>Due: {formatDate(task.dueDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    <span>${task.payment}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant={task.status === 'in_progress' ? 'default' : 'outline'}>
                                    {task.status === 'in_progress' ? 'Submit' : 'Start Task'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Tasks</CardTitle>
                      <CardDescription>
                        Tasks you've successfully completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {completedTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start p-4 sm:p-6"
                          >
                            <Avatar className="h-12 w-12 hidden sm:flex mr-4">
                              <AvatarImage src={task.brandLogo} alt={task.brand} />
                              <AvatarFallback>{task.brand.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">{task.brand}</p>
                                  <p className="text-base font-semibold">{task.title}</p>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                  Completed
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                  <div className="flex items-center">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    <span>Completed: {formatDate(task.completedDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    <span>${task.payment}</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>

            {/* --- Discover Tab --- */}
            <TabsContent value="discover" className="space-y-6">
              <BlurIn>
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Brand Collaborations</CardTitle>
                      <CardDescription>
                        These brands match your content niche and audience profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {recommendedBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-start p-4 sm:p-6"
                          >
                            <Avatar className="h-12 w-12 hidden sm:flex mr-4">
                              <AvatarImage src={brand.logo} alt={brand.name} />
                              <AvatarFallback>{brand.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-base font-semibold">{brand.name}</p>
                                  <p className="text-sm text-muted-foreground">{brand.industry}</p>
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {brand.match}
                                </Badge>
                              </div>
                              <p className="text-sm">{brand.description}</p>
                              <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline">View Profile</Button>
                                <Button size="sm">Contact Brand</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 py-4">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                          Looking for more collaborations?
                        </p>
                        <Link href="/discover">
                          <Button variant="link" className="gap-1">
                            Browse All Brands
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>

            {/* --- Profile Tab Content --- */}
            <TabsContent value="profile" className="space-y-8">
              <BlurIn>
                <form onSubmit={handleSaveChanges}>
                  <Card className="overflow-hidden">
                    {/* Cover Image Section */}
                    <div className="h-48 bg-muted relative">
                      {influencerProfile.coverImage ? (
                        <img src={influencerProfile.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <span>No cover image</span>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="absolute top-4 right-4 gap-1">
                        <Upload className="h-3 w-3" /> Change Cover
                      </Button>
                    </div>

                    <CardContent className="p-6 md:p-8 relative">
                      {/* Avatar Section */}
                      <div className="absolute -top-16 left-6 md:left-8">
                        <Avatar className="h-32 w-32 border-4 border-background">
                          <AvatarImage src={influencerProfile.avatar || undefined} alt={`${firstName} ${lastName}`} />
                          <AvatarFallback className="text-4xl">
                            {firstName?.[0]}{lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button size="sm" variant="outline" className="absolute bottom-2 right-2 rounded-full p-1 h-auto gap-1">
                          <Upload className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Form Fields Start Below Avatar */}
                      <div className="pt-20 space-y-6">
                        {/* Saving Indicators */}
                        {saveSuccess && (
                          <div className="p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Profile saved successfully!
                          </div>
                        )}
                        {saveError && (
                          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> Error: {saveError}
                          </div>
                        )}

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                          </div>
                        </div>

                        {/* Location and Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium">Location</label>
                            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., New York, USA" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="website" className="text-sm font-medium">Website / Portfolio</label>
                            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                          <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell brands about yourself..." className="min-h-[100px]" />
                        </div>

                        {/* Niches Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium block mb-3">Your Niches</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {availableNiches.map((niche) => (
                              <Button
                                key={niche}
                                type="button"
                                variant={selectedNiches.includes(niche) ? "default" : "outline"}
                                onClick={() => toggleNiche(niche)}
                                className="justify-start text-xs h-8"
                              >
                                {selectedNiches.includes(niche) && <Check className="mr-2 h-3 w-3" />} {niche}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Content Types Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium block mb-3">Content Types You Create</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {availableContentTypes.map((type) => (
                              <Button
                                key={type}
                                type="button"
                                variant={selectedContentTypes.includes(type) ? "default" : "outline"}
                                onClick={() => toggleContentType(type)}
                                className="justify-start text-xs h-8"
                              >
                                {selectedContentTypes.includes(type) && <Check className="mr-2 h-3 w-3" />} {type}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Social Accounts Placeholder - TODO: Implement fully */}
                        <div className="space-y-2 border-t pt-6">
                          <h3 className="text-lg font-semibold">Social Accounts</h3>
                          <p className="text-sm text-muted-foreground">Link your social media profiles. (Functionality coming soon)</p>
                          {/* Add UI for linking/displaying accounts here */}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 flex items-center justify-end gap-4 border-t">
                          <Button variant="outline" type="button" onClick={() => setActiveTab('overview')} disabled={isSaving}>Cancel</Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </BlurIn>
            </TabsContent>
            {/* --- End Profile Tab Content --- */}

          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;