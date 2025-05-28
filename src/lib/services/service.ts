import prisma from '@/lib/prisma';
import { Service, Prisma } from '@prisma/client';

interface ServiceFilters {
  category?: string;
  search?: string;
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
      const where: Prisma.ServiceWhereInput = {
        ...(filters?.category && {
          category: filters.category
        }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } }
          ]
        })
      };

      const orderBy: Prisma.ServiceOrderByWithRelationInput = filters?.sortBy
        ? { [filters.sortBy]: filters.sortOrder || 'asc' }
        : { createdAt: 'desc' };

      const services = await prisma.service.findMany({
        where,
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

  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const services = await prisma.service.findMany({
        where: { category },
        orderBy: { createdAt: 'desc' }
      });

      return services;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw new Error('Failed to fetch services by category');
    }
  }

  async searchServices(query: string): Promise<Service[]> {
    try {
      const services = await prisma.service.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: query, mode: Prisma.QueryMode.insensitive } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      return services;
    } catch (error) {
      console.error('Error searching services:', error);
      throw new Error('Failed to search services');
    }
  }
} 