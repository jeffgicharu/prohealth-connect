"use client";

import { useInView } from 'react-intersection-observer';
import ServiceCard from '@/components/cards/ServiceCard';
import { Service } from "@prisma/client";

interface AnimatedServiceCardWrapperProps {
  service: Service;
  index: number; // Used for staggered animation delay
}

export function AnimatedServiceCardWrapper({ service, index }: AnimatedServiceCardWrapperProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: index * 100, // Staggered delay: 0ms for 1st, 100ms for 2nd, etc.
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <ServiceCard service={service} />
    </div>
  );
} 