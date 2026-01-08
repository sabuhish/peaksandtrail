import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toursService } from '@/services/tours'
import { participantsService } from '@/services/participants'
import type { TourWithParticipants, ParticipantCreate } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Plus, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function TourDetail() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [tour, setTour] = useState<TourWithParticipants | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<ParticipantCreate, 'tour_id'>>({
    name: '',
    surname: '',
    paid_amount: 0,
    birth_date: '',
    phone_number: '',
    email: '',
  })

  useEffect(() => {
    if (id) {
      loadTour()
    }
  }, [id])

  const loadTour = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await toursService.getById(id)
      setTour(data)
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddParticipant = () => {
    setFormData({
      name: '',
      surname: '',
      paid_amount: 0,
      birth_date: '',
      phone_number: '',
      email: '',
    })
    setIsDialogOpen(true)
  }

  const handleDeleteParticipant = async (participantId: string) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      try {
        await participantsService.delete(participantId)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Participant removed successfully.',
        })
        await loadTour()
      } catch (error) {
        // Error is handled by axios interceptor
      }
    }
  }

  const handleExportTour = async () => {
    if (!id) return
    try {
      const response = await toursService.exportTour(id)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${tour?.name || 'tour'}_participants.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Participants list exported successfully.',
      })
    } catch (error) {
      // Error is handled by axios interceptor
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await participantsService.create({
        ...formData,
        tour_id: id,
      })
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Participant added successfully.',
      })
      setIsDialogOpen(false)
      await loadTour()
    } catch (error) {
      // Error is handled by axios interceptor
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading...</div>
  }

  if (!tour) {
    return <div className="container mx-auto py-10 text-center">Tour not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tours">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{tour.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tour Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Start Date:</span>{' '}
              {new Date(tour.start_date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-semibold">End Date:</span>{' '}
              {new Date(tour.end_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <span className="font-semibold">Guides:</span> {tour.guides}
          </div>
          <div>
            <span className="font-semibold">Plan:</span>
            <div className="prose prose-sm max-w-none mt-1">
              <ReactMarkdown>{tour.plan}</ReactMarkdown>
            </div>
          </div>
          {tour.info && (
            <div>
              <span className="font-semibold">Additional Info:</span>
              <div className="prose prose-sm max-w-none mt-1">
                <ReactMarkdown>{tour.info}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between max-sm:block max-sm:space-y-2">
            <div>
              <CardTitle>Participants</CardTitle>
              <CardDescription>{tour.participants.length} registered</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={handleExportTour}>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              <Button onClick={handleAddParticipant}>
                <Plus className="mr-2 h-4 w-4" />
                Add Participant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tour.participants.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No participants registered yet
            </div>
          ) : (
            <div className="space-y-4">
              {tour.participants.map((participant) => (
                <Card key={participant.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="grid gap-2 flex-1">
                        <div className="font-semibold text-lg">
                          {participant.name} {participant.surname}
                        </div>
                        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Email:</span> {participant.email}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>{' '}
                            {participant.phone_number}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Birth Date:</span>{' '}
                            {new Date(participant.birth_date).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Paid Amount:</span> ₼
                            {participant.paid_amount}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteParticipant(participant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>Fill in the participant details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paid_amount">Paid Amount</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    step="0.01"
                    value={formData.paid_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, paid_amount: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Participant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
