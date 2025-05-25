import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import BookingsList from "@/components/features/bookings/BookingsList";

// Sample bookings data - In a real app, this would come from your database
const bookings = [
  {
    id: "B001",
    service: "Mindfulness Coaching Session",
    date: "2024-03-20",
    time: "10:00 AM",
    location: "Virtual Session",
    provider: "Dr. Sarah Johnson",
  },
  {
    id: "B002",
    service: "Nutritional Consultation",
    date: "2024-03-25",
    time: "2:30 PM",
    location: "Wellness Center",
    provider: "Dr. Michael Chen",
  },
];

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/bookings");
  }

  return (
    <BookingsList 
      bookings={bookings}
      userName={session.user?.name || session.user?.email || "User"}
    />
  );
}
