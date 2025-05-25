import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/authOptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/profile')
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-brand-light-gray">Name</h3>
            <p className="text-lg">{session.user?.name || 'Not provided'}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-brand-light-gray">Email</h3>
            <p className="text-lg">{session.user?.email}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 