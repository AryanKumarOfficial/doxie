import React from "react";
import { Container } from "@/components/ui/container";
import { MotionDiv } from "@/components/ui/motion-div";
import { PricingCard } from "@/components/home/PricingCard";
import { FeatureAvailable, FeatureUnavailable } from "@/components/home/FeatureAvailability";
import { pricingPlans, featureTableRows } from "@/components/home/homeData";

export function PricingSection() {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -bottom-20 -left-20"></div>
        <div className="absolute w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-20 -top-20 -right-20"></div>
      </div>
      
      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">
              Choose the plan that's right for you. All plans include a 14-day free trial.
            </p>
          </MotionDiv>
        </div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              popular={plan.isPopular}
              delay={index * 0.1}
              buttonText={plan.name === "Free" ? "Sign Up Free" : "Start Free Trial"}
              buttonHref={"/register"}
            />
          ))}
        </div>
        
        {/* Feature comparison table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">Pro</th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Team</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {featureTableRows.map((row, index) => (
                  <tr key={row.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <FeatureAvailable /> : <FeatureUnavailable />
                      ) : (
                        <span className="text-sm font-medium">{row.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <FeatureAvailable /> : <FeatureUnavailable />
                      ) : (
                        <span className="text-sm font-medium">{row.pro}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.team === 'boolean' ? (
                        row.team ? <FeatureAvailable /> : <FeatureUnavailable />
                      ) : (
                        <span className="text-sm font-medium">{row.team}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MotionDiv>
        </div>
      </Container>
    </section>
  );
}