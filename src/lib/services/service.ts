import prisma from '@/lib/prisma';
import { Service, Prisma } from '@prisma/client';

interface ServiceFilters {
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class ServiceService {
  private static instance: ServiceService;

  private constructor() {}

  static getInstance(): ServiceService {
    if (!this.instance) {
      this.instance = new ServiceService();
    }
    return this.instance;
  }

  async getAllServices(filters?: ServiceFilters): Promise<Service[]> {
    try {
      const orderBy: Prisma.ServiceOrderByWithRelationInput = filters?.sortBy
        ? { [filters.sortBy]: filters.sortOrder || 'asc' }
        : { createdAt: 'desc' };

      const services = await prisma.service.findMany({
        orderBy
      });

      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      return service;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  }
} 