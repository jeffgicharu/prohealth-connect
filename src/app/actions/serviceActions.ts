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

export async function getServicesByCategory(category: string) {
  try {
    const serviceService = ServiceService.getInstance();
    const services = await serviceService.getServicesByCategory(category);
    return services;
  } catch (error) {
    console.error(`Error fetching services for category ${category}:`, error);
    throw new Error("Failed to fetch services by category.");
  }
}

export async function searchServices(query: string) {
  try {
    const serviceService = ServiceService.getInstance();
    const services = await serviceService.searchServices(query);
    return services;
  } catch (error) {
    console.error(`Error searching services with query ${query}:`, error);
    throw new Error("Failed to search services.");
  }
} 