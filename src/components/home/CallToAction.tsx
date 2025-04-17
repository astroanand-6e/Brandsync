"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Brand?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of brands and influencers who are already creating amazing content together.
          </p>
          <div className="flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="group">
                Get Started
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;