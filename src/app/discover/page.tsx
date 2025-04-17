"use client";

import { useState } from "react";
import InfluencerGrid from "@/components/brand/InfluencerGrid";
import SearchFilter from "@/components/shared/SearchFilter";
import { FadeUp } from "@/components/ui/motion";

const Discover = () => {
  const [filters, setFilters] = useState({});

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    console.log("Applied filters:", newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-24 pb-20 px-6 md:px-10">
        <div className="container max-w-7xl mx-auto">
          <FadeUp>
            <div className="mb-16 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                Discover Creators
              </h1>
              <p className="text-lg text-muted-foreground">
                Find the perfect influencers for your brand campaigns. Use filters to narrow down by niche, followers, and engagement rate.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <SearchFilter onFilter={handleFilter} />
          </FadeUp>

          <InfluencerGrid />
        </div>
      </main>
    </div>
  );
};

export default Discover; 