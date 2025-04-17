"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Instagram, Youtube, Music } from "lucide-react";

const influencers = [
  {
    id: 1,
    name: "Sarah Johnson",
    handle: "@sarahj",
    image: "/avatars/sarah.jpg",
    followers: "125K",
    engagement: "4.2%",
    platforms: ["instagram", "youtube"],
    rating: 4.8,
    niche: "Fashion",
  },
  {
    id: 2,
    name: "Mike Chen",
    handle: "@mikechen",
    image: "/avatars/mike.jpg",
    followers: "89K",
    engagement: "5.1%",
    platforms: ["instagram", "tiktok"],
    rating: 4.9,
    niche: "Fitness",
  },
  {
    id: 3,
    name: "Emma Wilson",
    handle: "@emmawilson",
    image: "/avatars/emma.jpg",
    followers: "256K",
    engagement: "3.8%",
    platforms: ["instagram", "youtube", "tiktok"],
    rating: 4.7,
    niche: "Lifestyle",
  },
  // Add more influencers as needed
];

const InfluencerGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {influencers.map((influencer) => (
        <Card key={influencer.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage src={influencer.image} alt={influencer.name} />
              <AvatarFallback>
                {influencer.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{influencer.name}</h3>
              <p className="text-sm text-muted-foreground">{influencer.handle}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Followers:</span>
                <span className="font-medium">{influencer.followers}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Engagement:</span>
                <span className="font-medium">{influencer.engagement}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{influencer.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Platforms:</span>
                <div className="flex gap-2">
                  {influencer.platforms.includes("instagram") && (
                    <Instagram className="h-4 w-4" />
                  )}
                  {influencer.platforms.includes("youtube") && (
                    <Youtube className="h-4 w-4" />
                  )}
                  {influencer.platforms.includes("tiktok") && (
                    <Music className="h-4 w-4" />
                  )}
                </div>
              </div>
              <Button className="w-full">View Profile</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InfluencerGrid; 