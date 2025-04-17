"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeUp, BlurIn } from "@/components/ui/motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Briefcase, 
  Search, 
  CheckCircle2, 
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  LineChart,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Define types for our data structure
interface Influencer {
  id: number;
  name: string;
  avatar: string;
  tasksCompleted: number;
  totalTasks: number;
  engagement: number;
  status: "on_track" | "behind" | "completed";
}

interface Campaign {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  roi?: number;
  influencers: Influencer[];
}

interface RecommendedInfluencer {
  id: number;
  name: string;
  avatar: string;
  category: string;
  followers: string;
  engagement: string;
  match: string;
  description: string;
}

// Mock data for active campaigns with influencers
const activeCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Collection Launch",
    status: "active",
    startDate: "2025-03-15",
    endDate: "2025-05-15",
    budget: 5000,
    spent: 2500,
    influencers: [
      {
        id: 101,
        name: "Fashion Influencer",
        avatar: "/placeholder.svg",
        tasksCompleted: 2,
        totalTasks: 5,
        engagement: 4.2,
        status: "on_track"
      },
      {
        id: 102,
        name: "Lifestyle Creator",
        avatar: "/placeholder.svg",
        tasksCompleted: 3,
        totalTasks: 5,
        engagement: 3.8,
        status: "behind"
      },
      {
        id: 103,
        name: "Social Media Expert",
        avatar: "/placeholder.svg",
        tasksCompleted: 4,
        totalTasks: 5,
        engagement: 4.7,
        status: "on_track"
      }
    ]
  },
  {
    id: 2,
    name: "Product Review Series",
    status: "active",
    startDate: "2025-04-01",
    endDate: "2025-06-01",
    budget: 3000,
    spent: 1200,
    influencers: [
      {
        id: 104,
        name: "Tech Reviewer",
        avatar: "/placeholder.svg",
        tasksCompleted: 2,
        totalTasks: 4,
        engagement: 4.5,
        status: "on_track"
      },
      {
        id: 105,
        name: "Gadget Enthusiast",
        avatar: "/placeholder.svg",
        tasksCompleted: 1,
        totalTasks: 4,
        engagement: 3.9,
        status: "behind"
      }
    ]
  }
];

// Mock data for completed campaigns
const completedCampaigns: Campaign[] = [
  {
    id: 3,
    name: "Winter Collection Promotion",
    status: "completed",
    startDate: "2024-11-01",
    endDate: "2025-02-28",
    budget: 4000,
    spent: 3800,
    roi: 2.3,
    influencers: [
      {
        id: 106,
        name: "Winter Fashion Expert",
        avatar: "/placeholder.svg",
        tasksCompleted: 6,
        totalTasks: 6,
        engagement: 4.8,
        status: "completed"
      },
      {
        id: 107,
        name: "Holiday Content Creator",
        avatar: "/placeholder.svg",
        tasksCompleted: 6,
        totalTasks: 6,
        engagement: 4.2,
        status: "completed"
      }
    ]
  }
];

// Mock data for recommended influencers
const recommendedInfluencers: RecommendedInfluencer[] = [
  {
    id: 201,
    name: "Travel Blogger",
    avatar: "/placeholder.svg",
    category: "Travel & Lifestyle",
    followers: "250K+",
    engagement: "4.8%",
    match: "95% match",
    description: "Creates authentic travel content with a focus on sustainable tourism",
  },
  {
    id: 202,
    name: "Fitness Coach",
    avatar: "/placeholder.svg",
    category: "Health & Fitness",
    followers: "500K+",
    engagement: "3.9%",
    match: "92% match",
    description: "Specializes in workout routines and nutrition advice for everyday fitness enthusiasts",
  },
  {
    id: 203,
    name: "Beauty Guru",
    avatar: "/placeholder.svg",
    category: "Beauty & Cosmetics",
    followers: "750K+",
    engagement: "4.2%",
    match: "88% match",
    description: "Creates makeup tutorials and honest product reviews for a diverse audience",
  },
];

interface CampaignStats {
  active: number;
  completed: number;
  totalInfluencers: number;
  completionRate: number;
  totalBudget: number;
  totalSpent: number;
}

// Calculate campaign stats
const calculateCampaignStats = (): CampaignStats => {
  const active = activeCampaigns.length;
  const completed = completedCampaigns.length;
  
  // Calculate total influencers across all active campaigns
  const totalInfluencers = activeCampaigns.reduce((sum, campaign) => 
    sum + campaign.influencers.length, 0
  );
  
  // Calculate overall completion rate
  const totalTasks = activeCampaigns.reduce((sum, campaign) => 
    sum + campaign.influencers.reduce((tasks, influencer) => tasks + influencer.totalTasks, 0), 0
  );
  
  const completedTasks = activeCampaigns.reduce((sum, campaign) => 
    sum + campaign.influencers.reduce((tasks, influencer) => tasks + influencer.tasksCompleted, 0), 0
  );
  
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Calculate total budget and spent across active campaigns
  const totalBudget = activeCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpent = activeCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  
  return { 
    active, 
    completed, 
    totalInfluencers, 
    completionRate,
    totalBudget,
    totalSpent
  };
};

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, userProfile } = useAuth();
  const stats = calculateCampaignStats();

  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate progress percentage for a campaign
  const calculateProgress = (campaign: Campaign): number => {
    const totalTasks = campaign.influencers.reduce((sum: number, influencer: Influencer) => sum + influencer.totalTasks, 0);
    const completedTasks = campaign.influencers.reduce((sum: number, influencer: Influencer) => sum + influencer.tasksCompleted, 0);
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Calculate budget utilization percentage
  const calculateBudgetUtilization = (campaign: Campaign): number => {
    return campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-20 px-6 md:px-10">
        <div className="container max-w-7xl mx-auto">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Brand Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your influencer campaigns and track performance
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link href="/discover">
                  <Button className="gap-2">
                    <Search className="h-4 w-4" />
                    Find Influencers
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
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <BlurIn>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Campaigns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Active Influencers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{stats.totalInfluencers}</div>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Task Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Budget Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">${stats.totalSpent} <span className="text-sm text-muted-foreground">/ ${stats.totalBudget}</span></div>
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
                      <CardTitle>Active Campaign Progress</CardTitle>
                      <CardDescription>
                        Track your influencer campaign progress and performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {activeCampaigns.map((campaign) => (
                          <div key={campaign.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{campaign.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {campaign.status}
                              </Badge>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{calculateProgress(campaign)}%</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full" 
                                  style={{ width: `${calculateProgress(campaign)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Budget utilization */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Budget Utilization</span>
                                <span className="font-medium">${campaign.spent} / ${campaign.budget}</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary/70 rounded-full" 
                                  style={{ width: `${calculateBudgetUtilization(campaign)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("campaigns")}>
                        View All Campaigns
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recommended Influencers</CardTitle>
                      <CardDescription>
                        Potential influencers that match your brand profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendedInfluencers.slice(0, 3).map((influencer) => (
                          <div
                            key={influencer.id}
                            className="flex items-start space-x-4 rounded-md border p-4"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={influencer.avatar} alt={influencer.name} />
                              <AvatarFallback>{influencer.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">{influencer.name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {influencer.match}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{influencer.category}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Followers: {influencer.followers}</span>
                                <span>Engagement: {influencer.engagement}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href="/discover" className="w-full">
                        <Button variant="outline" className="w-full">
                          Find More Influencers
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <BlurIn>
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle>Active Campaigns</CardTitle>
                        <CardDescription>
                          Track your ongoing influencer campaigns
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        New Campaign
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {activeCampaigns.map((campaign) => (
                          <div key={campaign.id} className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                </p>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {campaign.status}
                              </Badge>
                            </div>
                            
                            {/* Progress and budget */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{calculateProgress(campaign)}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${calculateProgress(campaign)}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Budget</span>
                                  <span className="font-medium">${campaign.spent} / ${campaign.budget}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary/70 rounded-full" 
                                    style={{ width: `${calculateBudgetUtilization(campaign)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Influencers list */}
                            <h4 className="text-sm font-semibold mb-3">Influencers ({campaign.influencers.length})</h4>
                            <div className="space-y-3">
                              {campaign.influencers.map((influencer) => (
                                <div key={influencer.id} className="flex items-center justify-between border rounded-md p-3">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={influencer.avatar} alt={influencer.name} />
                                      <AvatarFallback>{influencer.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{influencer.name}</p>
                                      <div className="flex items-center text-xs text-muted-foreground">
                                        <span>Tasks: {influencer.tasksCompleted}/{influencer.totalTasks}</span>
                                        <span className="mx-2">•</span>
                                        <span>Engagement: {influencer.engagement}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={
                                      influencer.status === 'on_track' ? 'default' :
                                      influencer.status === 'behind' ? 'destructive' : 'outline'
                                    }>
                                      {influencer.status === 'on_track' ? 'On Track' : 
                                       influencer.status === 'behind' ? 'Behind' : 'Completed'}
                                    </Badge>
                                    <Button size="sm" variant="ghost">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button size="sm" variant="outline">View Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Campaigns</CardTitle>
                      <CardDescription>
                        Review performance of your past campaigns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {completedCampaigns.map((campaign) => (
                          <div key={campaign.id} className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Completed
                              </Badge>
                            </div>
                            
                            {/* Results summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-muted rounded-md p-3">
                                <p className="text-sm text-muted-foreground">Budget Spent</p>
                                <p className="text-lg font-semibold">${campaign.spent} <span className="text-sm text-muted-foreground">/ ${campaign.budget}</span></p>
                              </div>
                              <div className="bg-muted rounded-md p-3">
                                <p className="text-sm text-muted-foreground">Influencers</p>
                                <p className="text-lg font-semibold">{campaign.influencers.length}</p>
                              </div>
                              <div className="bg-muted rounded-md p-3">
                                <p className="text-sm text-muted-foreground">ROI</p>
                                <p className="text-lg font-semibold">{campaign.roi}x</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button size="sm" variant="outline">View Report</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>

            <TabsContent value="discover" className="space-y-6">
              <BlurIn>
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Influencers</CardTitle>
                      <CardDescription>
                        Discover influencers who match your brand values and target audience
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {recommendedInfluencers.map((influencer) => (
                          <div
                            key={influencer.id}
                            className="flex items-start p-4 sm:p-6"
                          >
                            <Avatar className="h-12 w-12 hidden sm:flex mr-4">
                              <AvatarImage src={influencer.avatar} alt={influencer.name} />
                              <AvatarFallback>{influencer.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-base font-semibold">{influencer.name}</p>
                                  <p className="text-sm text-muted-foreground">{influencer.category}</p>
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {influencer.match}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                <span>Followers: {influencer.followers}</span>
                                <span>Engagement: {influencer.engagement}</span>
                              </div>
                              <p className="text-sm">{influencer.description}</p>
                              <div className="flex justify-end space-x-2">
                                <Button size="sm" variant="outline">View Profile</Button>
                                <Button size="sm">Contact</Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/50 py-4">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                          Looking for more specific influencers?
                        </p>
                        <Link href="/discover">
                          <Button variant="link" className="gap-1">
                            Advanced Search
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </BlurIn>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;