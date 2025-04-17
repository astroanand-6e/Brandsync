'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

const FadeUp = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

const BlurIn = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, filter: 'blur(10px)' }}
    animate={{ opacity: 1, filter: 'blur(0px)' }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const Hero = () => {
  // Add smooth scroll function
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      window.scrollTo({
        top: featuresSection.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 px-6 md:px-10 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] rounded-full bg-brand/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] rounded-full bg-purple-400/10 blur-[100px]" />
      </div>

      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm mb-6">
                <span className="text-brand font-medium mr-2">New</span>
                <span className="text-muted-foreground">Introducing AI Matchmaking</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                <span className="inline-block">Connecting Brands with</span>{' '}
                <span className="text-brand inline-block">Perfect Influencers</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="text-lg text-muted-foreground max-w-md">
                Create authentic collaborations that drive real results and build lasting relationships in one seamless platform.
              </p>
            </FadeUp>

            <FadeUp delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="group">
                    <span>Start your journey</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features" onClick={scrollToFeatures}>
                  <Button variant="outline" size="lg">
                    Learn more
                  </Button>
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.5}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand" />
                  <span>10,000+ Influencers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand" />
                  <span>5,000+ Brands</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-brand" />
                  <span>$10M+ Generated</span>
                </div>
              </div>
            </FadeUp>
          </div>

          <BlurIn delay={0.3} className="perspective-500">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 glass rounded-3xl shadow-2xl transform rotate-6 opacity-40"></div>
              <div className="absolute inset-0 glass rounded-3xl shadow-xl transform rotate-3 opacity-70"></div>
              <div className="relative glass rounded-3xl shadow-lg p-6 h-full">
                {/* Mock Workfolio UI */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-secondary"></div>
                      <div>
                        <h3 className="font-semibold">Sarah Johnson</h3>
                        <p className="text-xs text-muted-foreground">Travel & Lifestyle Creator</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold">120K</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold">5.2%</p>
                      <p className="text-xs text-muted-foreground">Eng. Rate</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold">28</p>
                      <p className="text-xs text-muted-foreground">Campaigns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BlurIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;