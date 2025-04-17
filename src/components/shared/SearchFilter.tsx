"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  onFilter: (filters: any) => void;
}

const SearchFilter = ({ onFilter }: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("");

  const handleSearch = () => {
    onFilter({
      searchQuery,
      niche,
      followers,
      engagement,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search influencers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="beauty">Beauty</SelectItem>
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
          </SelectContent>
        </Select>

        <Select value={followers} onValueChange={setFollowers}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Followers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1k-10k">1K - 10K</SelectItem>
            <SelectItem value="10k-50k">10K - 50K</SelectItem>
            <SelectItem value="50k-100k">50K - 100K</SelectItem>
            <SelectItem value="100k-500k">100K - 500K</SelectItem>
            <SelectItem value="500k+">500K+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={engagement} onValueChange={setEngagement}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Engagement Rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-3">1% - 3%</SelectItem>
            <SelectItem value="3-5">3% - 5%</SelectItem>
            <SelectItem value="5-10">5% - 10%</SelectItem>
            <SelectItem value="10+">10%+</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
        </Button>
      </div>
    </div>
  );
};

export default SearchFilter; 