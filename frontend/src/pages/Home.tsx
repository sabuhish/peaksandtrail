import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mountain, Users, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Tour Management</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4" />
                <span>{user.full_name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Tour Management System</h1>
          <p className="text-muted-foreground text-lg">
            Manage your mountain tours and participants efficiently
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6" />
              <CardTitle>Tours</CardTitle>
            </div>
            <CardDescription>
              Create and manage your mountain tours, hiking expeditions, and city explorations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/tours">
              <Button className="w-full">Manage Tours</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <CardTitle>Participants</CardTitle>
            </div>
            <CardDescription>
              Add and track tour participants, payment information, and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/participants">
              <Button className="w-full">Manage Participants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
