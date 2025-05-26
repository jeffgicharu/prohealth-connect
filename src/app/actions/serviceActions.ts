"use server";

import prisma from "@/lib/prisma";

export async function getAllServices() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services.");
  }
}

export async function getServiceById(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    return service;
  } catch (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    throw new Error("Failed to fetch service details.");
  }
} 