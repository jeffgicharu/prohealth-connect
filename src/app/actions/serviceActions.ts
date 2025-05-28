"use server";

import { ServiceService } from "@/lib/services/service";

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
  try {
    const serviceService = ServiceService.getInstance();
    const service = await serviceService.getServiceById(serviceId);
    return service;
  } catch (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    throw new Error("Failed to fetch service details.");
  }
} 