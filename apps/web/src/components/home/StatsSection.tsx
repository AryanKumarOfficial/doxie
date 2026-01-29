import React from "react";
import { Container } from "@/components/ui/container";
import { StatsCounter } from "@/components/home/StatsCounter";
import { statistics } from "@/components/home/homeData";

export function StatsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <StatsCounter
              key={stat.label}
              value={stat.value}
              label={stat.label}
              icon={stat.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}