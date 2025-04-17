"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

const features = [
  {
    title: "Advanced Analytics",
    description: "Track campaign performance with real-time analytics and detailed insights.",
    icon: BarChart3,
  },
  {
    title: "Influencer Network",
    description: "Access a vast network of verified influencers across multiple platforms.",
    icon: Users,
  },
  {
    title: "Smart Messaging",
    description: "Streamline communication with built-in messaging and collaboration tools.",
    icon: MessageSquare,
  },
  {
    title: "Campaign Growth",
    description: "Scale your campaigns efficiently with automated tools and workflows.",
    icon: TrendingUp,
  },
  {
    title: "Secure Platform",
    description: "Enterprise-grade security to protect your data and campaigns.",
    icon: Shield,
  },
  {
    title: "Quick Setup",
    description: "Get started in minutes with our intuitive platform and onboarding.",
    icon: Zap,
  },
];

const Features = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Modern Brands
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to run successful influencer marketing campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features; 