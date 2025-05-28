import { NextResponse } from 'next/server';
import { ServiceService } from '@/lib/services/service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const resolvedParams = await params;
  const serviceId = resolvedParams.serviceId;

  if (!serviceId || typeof serviceId !== 'string') {
    return NextResponse.json(
      { error: 'Invalid service ID' },
      { status: 400 }
    );
  }

  try {
    const serviceService = ServiceService.getInstance();
    const service = await serviceService.getServiceById(serviceId);

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
// export async function POST(request: Request) {
//   // ...
//   return NextResponse.json({ message: "Created" }, { status: 201 });
// }