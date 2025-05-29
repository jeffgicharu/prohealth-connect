import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/authOptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NameEditForm } from "./NameEditForm" // Separate client component

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/profile')
  }

  // Handle potential null/undefined values safely
  const userName = session.user?.name || ''
  const userEmail = session.user?.email || 'No email provided'

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NameEditForm initialName={userName} />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-brand-light-gray">Email</h3>
            <p className="text-lg">{userEmail}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}