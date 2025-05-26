import { getAllServices } from "../actions/serviceActions";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Brain, Dumbbell, Stethoscope, Search } from "lucide-react"
import { Service } from "@prisma/client"

export default async function ServicesPage() {
  const services: Service[] = await getAllServices();

  return (
    <div className="min-h-screen bg-brand-white py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12 scroll-reveal">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            Explore Our <span className="text-brand-primary">Wellness Services</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-light-gray max-w-3xl mx-auto">
            Discover our comprehensive range of health and wellness services designed to support your journey to better health.
          </p>
        </div>
        {/* Search and Filter Section (disabled) */}
        <div className="mb-12 scroll-reveal opacity-50 pointer-events-none">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-light-gray w-5 h-5" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 h-12 border-brand-light-gray/30 focus:border-brand-primary"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-48 h-12 border-brand-light-gray/30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mental-health">Mental Health</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="general">General Health</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-48 h-12 border-brand-light-gray/30">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="low">Under Ksh 4,000</SelectItem>
                  <SelectItem value="medium">Ksh 4,000 - 6,000</SelectItem>
                  <SelectItem value="high">Above Ksh 6,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: Service, index: number) => (
            <Card
              key={service.id}
              className="scroll-reveal hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-brand-light-gray/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {/* Optionally render an icon or image if available */}
                </div>
                <h3 className="text-xl font-bold text-brand-dark">{service.name}</h3>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                <p className="text-brand-light-gray leading-relaxed mb-4">{service.description}</p>
                <div className="text-center">
                  <span className="text-2xl font-bold text-brand-dark">Ksh {service.price}</span>
                  <span className="text-brand-light-gray ml-1">{service.duration ? `/ ${service.duration} min` : null}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 px-6 pt-0">
                <Button
                  variant="outline"
                  className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
                >
                  View Details
                </Button>
                <Button 
                  className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-white transition-all duration-200"
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {/* Load More Section */}
        <div className="text-center mt-12 scroll-reveal">
          <Button
            variant="outline"
            size="lg"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 px-8"
          >
            Load More Services
          </Button>
        </div>
      </div>
    </div>
  )
}
