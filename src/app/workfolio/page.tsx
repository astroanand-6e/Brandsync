"use client";

import { useState } from "react";
import { FadeUp, BlurIn } from "@/components/ui/motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon,
  Plus,
  Upload,
  ChevronRight,
  Heart,
  MessageSquare,
  Users,
  CheckCircle
} from "lucide-react";

const socialAccounts = [
  {
    platform: "Instagram",
    username: "@yourhandle",
    followers: "120K",
    icon: <Instagram className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
  },
  {
    platform: "Twitter",
    username: "@yourhandle",
    followers: "85K",
    icon: <Twitter className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    platform: "YouTube",
    username: "Your Channel",
    followers: "250K",
    icon: <Youtube className="h-5 w-5" />,
    color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
];

const pastCollaborations = [
  {
    brand: "Fashion Brand",
    campaign: "Summer Collection",
    date: "Jun 2023",
    description: "Promoted summer collection through Instagram posts and stories",
    engagement: "4.8%",
    logo: "/placeholder.svg",
  },
  {
    brand: "Tech Company",
    campaign: "Product Launch",
    date: "Mar 2023",
    description: "Created YouTube review for new smartphone release",
    engagement: "5.2%",
    logo: "/placeholder.svg",
  },
  {
    brand: "Beauty Brand",
    campaign: "Skincare Line",
    date: "Jan 2023",
    description: "Featured skincare routine using brand products",
    engagement: "4.5%",
    logo: "/placeholder.svg",
  },
];

const Workfolio = () => {
  const [activeTab, setActiveTab] = useState("preview");

  // TODO: Add state for form fields

  const handleSaveChanges = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Save Changes clicked!");
    // TODO: Gather form data from state
    // TODO: Call API to save profile data
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-20 px-6 md:px-10">
        <div className="container max-w-7xl mx-auto">
          <FadeUp>
            <div className="mb-10 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Your Workfolio
              </h1>
              <p className="text-lg text-muted-foreground">
                Create and manage your professional profile to showcase your work to brands and potential collaborators.
              </p>
            </div>
          </FadeUp>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-8">
              <BlurIn>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="h-48 bg-secondary relative">
                    <Button variant="ghost" size="sm" className="absolute top-4 right-4">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Cover
                    </Button>
                  </div>

                  <div className="p-6 md:p-8 relative">
                    <Avatar className="h-24 w-24 border-4 border-background absolute -top-12 left-8">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>

                    <div className="pt-14">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold mb-1">Jane Doe</h2>
                          <p className="text-muted-foreground">Lifestyle & Travel Content Creator</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button variant="default" size="sm">
                            <Heart className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Followers</p>
                              <p className="text-xl font-semibold">455K+</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                              <Heart className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                              <p className="text-xl font-semibold">4.8%</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Campaigns</p>
                              <p className="text-xl font-semibold">32</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">About</h3>
                        <p className="text-muted-foreground">
                          Hi, I'm Jane! I create authentic travel and lifestyle content focused on sustainable living and mindful travel. With a community of engaged followers across platforms, I help brands connect with conscious consumers through authentic storytelling and high-quality visuals.
                        </p>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Content Niches</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge>Travel</Badge>
                          <Badge>Lifestyle</Badge>
                          <Badge>Sustainability</Badge>
                          <Badge>Photography</Badge>
                          <Badge>Fashion</Badge>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Social Accounts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {socialAccounts.map((account, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-4 rounded-lg border border-border"
                            >
                              <div className={`${account.color} p-2 rounded-lg`}>
                                {account.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{account.platform}</p>
                                <p className="text-sm text-muted-foreground">{account.username}</p>
                              </div>
                              <div className="text-sm font-medium">{account.followers}</div>
                            </div>
                          ))}
                          <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Account
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Past Collaborations</h3>
                          <Button variant="link" size="sm" className="group">
                            View All
                            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pastCollaborations.map((collab, index) => (
                            <Card key={index}>
                              <CardContent className="p-5">
                                <div className="flex items-start gap-4 mb-3">
                                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                                    <img
                                      src={collab.logo}
                                      alt={collab.brand}
                                      className="h-6 w-6"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{collab.brand}</h4>
                                    <p className="text-sm text-muted-foreground">{collab.campaign}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{collab.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">{collab.date}</span>
                                  <Badge variant="secondary">{collab.engagement} Engagement</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <Card>
                            <CardContent className="p-5 flex items-center justify-center h-full min-h-[160px]">
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Collaboration
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">Unique UTM Link</h4>
                            <p className="text-sm text-muted-foreground">Share this link to track referrals to your profile</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value="https://brandsync.io/creator/janedoe?utm=profile"
                              className="max-w-xs"
                              readOnly
                            />
                            <Button size="icon" variant="outline">
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </BlurIn>
            </TabsContent>

            <TabsContent value="edit" className="space-y-8">
              <form onSubmit={handleSaveChanges}>
                <div className="bg-card border border-border rounded-xl p-6 md:p-8 animate-fade-in">
                  <h2 className="text-xl font-semibold mb-6">Edit Your Profile</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input id="name" defaultValue="Jane Doe" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <Input id="username" defaultValue="janedoe" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Professional Title</label>
                      <Input id="title" defaultValue="Lifestyle & Travel Content Creator" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                      <Textarea
                        id="bio"
                        rows={4}
                        defaultValue="Hi, I'm Jane! I create authentic travel and lifestyle content focused on sustainable living and mindful travel. With a community of engaged followers across platforms, I help brands connect with conscious consumers through authentic storytelling and high-quality visuals."
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Content Niches</label>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Niche
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="gap-2">
                          Travel
                          <button className="h-4 w-4 rounded-full hover:bg-primary-foreground/20">×</button>
                        </Badge>
                        <Badge className="gap-2">
                          Lifestyle
                          <button className="h-4 w-4 rounded-full hover:bg-primary-foreground/20">×</button>
                        </Badge>
                        <Badge className="gap-2">
                          Sustainability
                          <button className="h-4 w-4 rounded-full hover:bg-primary-foreground/20">×</button>
                        </Badge>
                        <Badge className="gap-2">
                          Photography
                          <button className="h-4 w-4 rounded-full hover:bg-primary-foreground/20">×</button>
                        </Badge>
                        <Badge className="gap-2">
                          Fashion
                          <button className="h-4 w-4 rounded-full hover:bg-primary-foreground/20">×</button>
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Social Accounts</label>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Connect Account
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {socialAccounts.map((account, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-lg border border-border"
                          >
                            <div className={`${account.color} p-2 rounded-lg`}>
                              {account.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{account.platform}</p>
                              <p className="text-sm text-muted-foreground">{account.username}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-6 flex items-center justify-end gap-4">
                      <Button variant="outline" type="button">Cancel</Button> {/* Added type="button" */} 
                      <Button type="submit">Save Changes</Button> {/* Changed to type="submit" */} 
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Workfolio;