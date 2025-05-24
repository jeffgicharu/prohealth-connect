"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, User } from "lucide-react"

export default function BookingsPage() {
  const router = useRouter()

  const handleExploreServices = () => {
    router.push("/services")
  }

  const handleViewDetails = (bookingId: string) => {
    console.log(`View Details clicked for Booking: ${bookingId}`)
  }

  // Sample bookings data
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
  ]

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            My <span className="text-brand-primary">Bookings</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
            View and manage your upcoming wellness appointments and consultations.
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-brand-light-gray/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-brand-light-gray" />
            </div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">No Bookings Yet</h2>
            <p className="text-brand-light-gray mb-8">Start your wellness journey by exploring our services.</p>
            <Button
              size="lg"
              className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white"
              onClick={handleExploreServices}
            >
              Explore Services
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-brand-dark">{booking.service}</CardTitle>
                  <CardDescription className="text-brand-light-gray">Booking ID: {booking.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-brand-dark">
                    <Calendar className="w-5 h-5 mr-2 text-brand-primary" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center text-brand-dark">
                    <Clock className="w-5 h-5 mr-2 text-brand-primary" />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center text-brand-dark">
                    <MapPin className="w-5 h-5 mr-2 text-brand-primary" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center text-brand-dark">
                    <User className="w-5 h-5 mr-2 text-brand-primary" />
                    <span>{booking.provider}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                    onClick={() => handleViewDetails(booking.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
