import prisma from '@/lib/prisma';
import { Service, Prisma } from '@prisma/client';

interface ServiceFilters {
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Create a type for the selected fields to ensure consistency
type ServiceWithSelectedFields = Pick<Service, 
  'id' | 'name' | 'description' | 'price' | 'category' | 'imageUrl' | 
  'duration' | 'createdAt' | 'updatedAt' | 'practitionerName'
>;

export class ServiceService {
  private static instance: ServiceService;

  private constructor() {}

  static getInstance(): ServiceService {
    if (!this.instance) {
      this.instance = new ServiceService();
    }
    return this.instance;
  }

  async getAllServices(filters?: ServiceFilters): Promise<ServiceWithSelectedFields[]> {
    try {
      const orderBy: Prisma.ServiceOrderByWithRelationInput = filters?.sortBy
        ? { [filters.sortBy]: filters.sortOrder || 'asc' }
        : { createdAt: 'desc' };

      const services = await prisma.service.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          duration: true,           // Added missing field
          practitionerName: true,   // Added missing field
          createdAt: true,
          updatedAt: true,
        },
        orderBy
      });

      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  async getServiceById(serviceId: string): Promise<ServiceWithSelectedFields | null> {
    try {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          duration: true,
          practitionerName: true,   // Added missing field here too
          createdAt: true,
          updatedAt: true,
        }
      });

      return service;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  }
}