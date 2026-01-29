import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { TimelineStep } from './TimelineStep';
import { timelineSteps } from './homeData';

export function TimelineSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50 overflow-hidden">
      <Container className="max-w-7xl">
        <div className="text-center mb-8 md:mb-12 lg:mb-16 px-4">
          <Badge className="mb-3 md:mb-4 py-1.5 px-3 bg-blue-50 text-blue-700 border-none">How It Works</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
            Simple & Intuitive Process
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Get started in minutes with our straightforward note-taking process.
          </p>
        </div>

        {/* Mobile Timeline (visible on small screens) */}
        <div className="md:hidden relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          <div className="space-y-8 ml-5 pl-8 pr-4">
            {timelineSteps.map((step, index) => (
              <TimelineStep 
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isMobile={true}
                delay={index * 0.15}
              />
            ))}
          </div>
        </div>

        {/* Desktop Timeline (visible on medium and large screens) */}
        <div className="hidden md:block relative max-w-5xl mx-auto px-4">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          <div className="space-y-14 lg:space-y-20">
            {timelineSteps.map((step, index) => (
              <TimelineStep 
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
                position={index % 2 === 0 ? 'left' : 'right'}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}