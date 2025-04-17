'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const FadeUp = ({ children, delay = 0, className = '' }: FadeUpProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description:
      'Sign up and build your profile as a brand or influencer. Connect your social accounts and showcase your work or brand values.',
    image: '/placeholder.svg',
  },
  {
    number: '02',
    title: 'Discover & Connect',
    description:
      'Search for brands or influencers that align with your goals. Use filters to find the perfect match for your campaign or niche.',
    image: '/placeholder.svg',
  },
  {
    number: '03',
    title: 'Collaborate & Create',
    description:
      'Communicate, negotiate terms, and sign contracts directly through the platform. Track deliverables and manage the entire process.',
    image: '/placeholder.svg',
  },
  {
    number: '04',
    title: 'Measure & Grow',
    description:
      'Analyze campaign performance, receive payments, and build long-term relationships that help both parties grow their business.',
    image: '/placeholder.svg',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 md:px-10 bg-secondary/50">
      <div className="container mx-auto max-w-7xl">
        <FadeUp className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent process
          </h2>
          <p className="text-lg text-muted-foreground">
            We've streamlined the influencer marketing workflow to make collaborations effortless and effective.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {steps.map((step, index) => (
            <FadeUp key={index} delay={0.15 * index} className="relative">
              <div className="relative">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-brand text-white font-semibold text-lg z-10 relative">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-px h-full bg-border"></div>
                    )}
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                    
                    <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-secondary">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 