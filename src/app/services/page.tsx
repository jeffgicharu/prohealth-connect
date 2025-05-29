import { Suspense } from 'react';
import { getAllServices } from "../actions/serviceActions";
import { AnimatedServiceCardWrapper } from '@/components/cards/AnimatedServiceCardWrapper';
import { Service } from "@prisma/client";
import ServicesLoading from '@/components/loading/ServicesLoading';

async function ServicesList() {
  const services: Service[] = await getAllServices();

  if (!services || services.length === 0) {
    return (
      <div className='text-center py-10'>
        <p className='text-brand-light-gray'>No services available at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
      {services.map((service, index) => (
        <AnimatedServiceCardWrapper key={service.id} service={service} index={index} />
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl md:text-4xl font-bold text-brand-dark mb-8 text-center'>
        Explore Our Wellness Services
      </h1>
      <Suspense fallback={<ServicesLoading />}>
        <ServicesList />
      </Suspense>
    </div>
  );
}
