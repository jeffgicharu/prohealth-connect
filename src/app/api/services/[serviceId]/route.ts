import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: {
    serviceId: string;
  };
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: context.params.serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
} 