import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  if (!serviceId || typeof serviceId !== 'string') {
    return NextResponse.json(
      { message: 'Service ID must be a string and is required.' },
      { status: 400 }
    );
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { message: `Service with ID '${serviceId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(service, { status: 200 });

  } catch (error) {
    console.error(`Error fetching service with ID '${serviceId}':`, error);
    // Ensure a generic error message is sent to the client for security
    return NextResponse.json(
      { message: 'An error occurred while fetching the service.' },
      { status: 500 }
    );
  }
}

// You can add other HTTP methods (POST, PUT, DELETE) below if needed,
// ensuring they also follow correct signatures and return responses.
// For example:
// export async function POST(request: NextRequest) {
//   // ...
//   return NextResponse.json({ message: "Created" }, { status: 201 });
// }