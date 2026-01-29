import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { FloatingTestimonial } from './FloatingTestimonial';
import { testimonials } from './homeData';
import { MotionDiv } from '@/components/ui/motion-div';

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white overflow-hidden">
      <Container>
        <div className="text-center mb-16 sm:mb-20 md:mb-24">
          <Badge className="mb-4 py-1.5 px-3 bg-blue-50 text-blue-700 border-none">Testimonials</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-blue-600">Users Say</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of satisfied users who have transformed their note-taking experience.
          </p>
        </div>

        {/* For smaller screens: stacked testimonials */}
        <div className="md:hidden space-y-6 px-4">
          {testimonials.map((testimonial, index) => (
            <MotionDiv
              key={`mobile-${index}`}
              className="bg-white p-5 rounded-xl shadow-lg border border-blue-50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                {/* Quote marks */}
                <svg className="w-7 h-7 text-blue-400 mb-2 opacity-70" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.96.78-3.022.684-1.06 1.304-1.78 1.86-2.164.393-.25.753-.19 1.08.18.34.39.35.786.02 1.18-.32.383-.75.753-1.28 1.11.48.237.87.795 1.16 1.67.29.87.45 1.42.45 1.648v.433c-.13.433-.33.75-.61.95-.28.2-.71.3-1.29.3-.54 0-.96-.15-1.27-.44-.31-.29-.47-.7-.47-1.24 0-.15.33-.76.99-1.83.37-.24.58-.36.63-.36-.08-.3-.3-.21-.57.27-.27.48-.39.84-.39 1.06 0 .21.06.39.17.54.11.15.28.22.52.22.16 0 .28-.03.36-.07.08-.04.16-.09.21-.15.05-.07.09-.15.11-.24.03-.1.04-.19.04-.31zm7.457 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.695-1.327-.825-.56-.13-1.083-.14-1.57-.025-.16-.94.09-1.95.75-3.02.66-1.06 1.29-1.78 1.89-2.164.39-.25.75-.19 1.09.18.33.39.33.786 0 1.18-.33.383-.75.753-1.28 1.11.5.237.88.795 1.17 1.67.29.87.44 1.42.44 1.648v.433c-.13.433-.33.75-.61.95-.28.2-.71.3-1.29.3-.54 0-.96-.15-1.26-.44-.32-.29-.48-.7-.48-1.24 0-.15.33-.76.99-1.83.36-.24.58-.36.63-.36-.08-.3-.3-.21-.57.27-.28.48-.39.84-.39 1.06 0 .21.06.39.17.54.11.15.28.22.52.22.16 0 .28-.03.37-.07.08-.04.16-.09.21-.15.05-.07.08-.15.11-.24.02-.1.03-.19.03-.31z" />
                </svg>
                
                <p className="text-sm text-gray-700">{testimonial.quote}</p>
              </div>
              
              <div className="flex items-center mt-4">
                <div className="relative w-10 h-10 mr-3 rounded-full overflow-hidden">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h5 className="font-medium text-sm">{testimonial.author}</h5>
                  <p className="text-xs text-gray-500">{testimonial.position}</p>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>

        {/* For medium-large screens: floating testimonials */}
        <div className="hidden md:block relative min-h-[500px] lg:min-h-[600px] mx-auto max-w-4xl">
          {/* Testimonials */}
          {testimonials.map((testimonial, index) => (
            <FloatingTestimonial
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              position={testimonial.position}
              image={testimonial.image}
              posX={testimonial.posX}
              posY={testimonial.posY}
              delay={index * 0.2}
            />
          ))}

          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-24 md:w-32 h-24 md:h-32 rounded-full bg-blue-200"></div>
            <div className="absolute bottom-1/3 right-1/5 w-20 md:w-24 h-20 md:h-24 rounded-full bg-teal-200"></div>
            <div className="absolute top-2/3 left-2/3 w-16 md:w-20 h-16 md:h-20 rounded-full bg-purple-200"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}