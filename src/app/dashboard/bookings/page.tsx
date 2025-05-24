"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, Plus, CheckCircle, AlertCircle, XCircle } from "lucide-react"

export default function BookingsPage() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-reveal")
    elements.forEach((el) => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  const upcomingBookings = [
    {
      id: 1,
      serviceName: "Mindfulness Coaching Session",
      date: "October 26, 2025",
      time: "10:00 AM",
      practitioner: "Dr. Emily Carter",
      status: "confirmed",
    },
    {
      id: 2,
      serviceName: "Nutritional Consultation",
      date: "October 28, 2025",
      time: "2:30 PM",
      practitioner: "Dr. Sarah Johnson",
      status: "pending",
    },
  ]

  const pastBookings = [
    {
      id: 3,
      serviceName: "General Health Checkup",
      date: "October 15, 2025",
      time: "9:00 AM",
      practitioner: "Dr. Michael Brown",
      status: "completed",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="hover:shadow-md transition-all duration-200 border-brand-light-gray/20">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-brand-dark mb-2">{booking.serviceName}</h3>
            <div className="space-y-2 text-brand-light-gray">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Date: {booking.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time: {booking.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>With: {booking.practitioner}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            {getStatusBadge(booking.status)}
            <Button
              variant="outline"
              size="sm"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary/10"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-brand-light-gray/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="w-10 h-10 text-brand-light-gray" />
      </div>
      <h3 className="text-xl font-semibold text-brand-dark mb-2">No bookings found</h3>
      <p className="text-brand-light-gray mb-6">You currently have no bookings in this category.</p>
      <Link href="/services">
        <Button className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white">
          <Plus className="w-4 h-4 mr-2" />
          Explore Services
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 scroll-reveal">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-4">
                Your <span className="text-brand-primary">Wellness Journey</span>
              </h1>
              <p className="text-lg text-brand-light-gray">
                Manage your health appointments and track your wellness progress.
              </p>
            </div>
            <Link href="/services">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover text-brand-white px-6 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Book New Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Bookings Tabs */}
        <div className="scroll-reveal">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="upcoming" className="text-lg py-3">
                Upcoming Bookings
              </TabsTrigger>
              <TabsTrigger value="past" className="text-lg py-3">
                Past Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 scroll-reveal">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Your Health Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">3</div>
                <p className="text-brand-light-gray">Total Bookings</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">2</div>
                <p className="text-brand-light-gray">Upcoming Sessions</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-brand-primary mb-2">1</div>
                <p className="text-brand-light-gray">Completed Sessions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
