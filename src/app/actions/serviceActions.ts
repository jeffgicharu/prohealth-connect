"use server";

import { ServiceService } from "@/lib/services/service";
import { z } from "zod";

// Define the service schema
const serviceIdSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
});

export async function getAllServices() {
  try {
    const serviceService = ServiceService.getInstance();
    const services = await serviceService.getAllServices();
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services.");
  }
}

export async function getServiceById(serviceId: string) {
  // Validate input using Zod schema
  const validation = serviceIdSchema.safeParse({ serviceId });
  
  if (!validation.success) {
    throw new Error('Invalid service ID');
  }

  try {
    const serviceService = ServiceService.getInstance();
    const service = await serviceService.getServiceById(validation.data.serviceId);
    return service;
  } catch (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    throw new Error("Failed to fetch service details.");
  }
} 