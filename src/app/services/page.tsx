import { Suspense } from 'react';
import { getAllServices } from "../actions/serviceActions";
import { AnimatedServiceCardWrapper } from '@/components/cards/AnimatedServiceCardWrapper';
import { Service } from "@prisma/client";
import ServicesLoading from '@/components/loading/ServicesLoading';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
      
      <div className="mb-8 p-4 border border-brand-light-gray/20 rounded-lg shadow-sm bg-white">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Mock Search Input */}
          <div className="flex-grow w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search services (e.g., 'nutrition', 'yoga')..."
              className="w-full border-brand-light-gray/30 focus:border-brand-primary"
              disabled // Non-functional for now
            />
          </div>

          {/* Mock Filter by Category Dropdown */}
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto flex justify-between items-center text-brand-light-gray border-brand-light-gray/30 hover:border-brand-primary disabled:opacity-100"
              disabled // Non-functional for now
            >
              Filter by Category
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Mock Sort By Dropdown */}
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full md:w-auto flex justify-between items-center text-brand-light-gray border-brand-light-gray/30 hover:border-brand-primary disabled:opacity-100"
              disabled // Non-functional for now
            >
              Sort By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Suspense fallback={<ServicesLoading />}>
        <ServicesList />
      </Suspense>
    </div>
  );
}
