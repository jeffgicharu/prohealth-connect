import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Service {
  id: string;
  name: string;
  price: number;
  description: string | null;
  duration: number | null;
  category: string | null;
  imageUrl: string | null;
  practitionerName: string | null;
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  bookingDate: Date;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  service: Service;
}

interface BookingCardProps {
  booking: Booking;
}

function BookingCard({ booking }: BookingCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "PAID":
        return "success";
      case "PENDING":
      case "UNPAID":
        return "secondary";
      case "CANCELLED":
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card className="mb-4 shadow-md">
      <CardHeader>
        <CardTitle className="text-brand-dark">{booking.service.name}</CardTitle>
        <CardDescription>
          Booked on: {format(new Date(booking.createdAt), "PPP p")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Booking Status:</span>
          <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Status:</span>
          <Badge variant={getStatusVariant(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
        </div>
        {booking.service.price && (
          <p className="text-sm text-gray-600">Price: Ksh {booking.service.price.toFixed(2)}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {booking.paymentStatus === "UNPAID" && booking.status !== "CANCELLED" && (
          <Link href={`/payment/${booking.id}`}>
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">Proceed to Payment</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/bookings");
  }

  const userBookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      service: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-8">My Bookings</h1>
      {userBookings.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-md rounded-lg">
          <p className="text-xl text-brand-light-gray mb-4">You have no bookings yet.</p>
          <Link href="/services">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-hover">Explore Services</Button>
          </Link>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          {userBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
