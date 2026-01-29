import React from "react";
import { Container } from "@/components/ui/container";
import { Feature3DCard } from "@/components/home/Feature3DCard";
import { features } from "@/components/home/homeData";
import { MotionDiv } from "@/components/ui/motion-div";

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600">
              Everything you need to capture your thoughts, ideas, and knowledge in one place.
            </p>
          </MotionDiv>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature3DCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}