import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { participantsService } from '@/services/participants'
import { toursService } from '@/services/tours'
import type { Participant, ParticipantCreate, ParticipantUpdate, Tour } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'

export default function Participants() {
  const { toast } = useToast()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [selectedTourId, setSelectedTourId] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 20
  const [formData, setFormData] = useState<ParticipantCreate>({
    tour_id: "",
    name: '',
    surname: '',
    paid_amount: 0,
    birth_date: '',
    phone_number: '',
    email: '',
  })

  
  

  useEffect(() => {
    loadData()
  }, [currentPage, selectedTourId])

  useEffect(() => {
    // Reset to page 1 when tour filter changes
    setCurrentPage(1)
  }, [selectedTourId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const [participantsData, toursData] = await Promise.all([
        participantsService.getAll(
          selectedTourId === 'all' ? undefined : selectedTourId,
          skip,
          itemsPerPage
        ),
        currentPage === 1 ? toursService.getAll(0, 100) : Promise.resolve(tours),
      ])
      setParticipants(participantsData)
      setHasMore(participantsData.length === itemsPerPage)
      if (currentPage === 1 && Array.isArray(toursData)) {
        setTours(toursData)
      }
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingParticipant(null)
    setFormData({
      tour_id: selectedTourId !== 'all' ? selectedTourId : (tours.length > 0 ? tours[0].id : ""),
      name: '',
      surname: '',
      paid_amount: 0,
      birth_date: '',
      phone_number: '',
      email: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setFormData({
      tour_id: participant.tour_id,
      name: participant.name,
      surname: participant.surname,
      paid_amount: participant.paid_amount,
      birth_date: participant.birth_date,
      phone_number: participant.phone_number,
      email: participant.email,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await participantsService.delete(id)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Participant deleted successfully.',
        })
        await loadData()
      } catch (error) {
        // Error is handled by axios interceptor
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingParticipant) {
        await participantsService.update(editingParticipant.id, formData as ParticipantUpdate)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Participant updated successfully.',
        })
      } else {
        await participantsService.create(formData)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Participant added successfully.',
        })
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      // Error is handled by axios interceptor
    }
  }

  const getTourName = (tourId: string) => {
    const tour = tours.find((t) => t.id === tourId)
    return tour?.name || 'Unknown Tour'
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6 max-sm:block max-sm:space-y-2">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Participants</h1>
        </div>
        <div className='flex gap-2 items-center max-sm:justify-end max-sm:flex-wrap max-sm:flex-col'>
          {tours.length > 0 && (
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-sm:w-full"
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
            >
              <option value="all">All Tours</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>
                  {tour.name}
                </option>
              ))}
            </select>
          )}
          <Button onClick={handleCreate} disabled={tours.length === 0} className='max-sm:w-full'>
            <Plus className="mr-2 h-4 w-4" />
            New Participant
          </Button>
        </div>

      </div>

      {tours.length === 0 && (
        <Card className="mb-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">
              Please create a tour first before adding participants.
            </p>
            <Link to="/tours">
              <Button className="mt-4">Go to Tours</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : participants.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No participants yet. Add your first participant!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {participants.map((participant) => (
              <Card key={participant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle>
                        {participant.name} {participant.surname}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tour: {getTourName(participant.tour_id)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(participant)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(participant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Email:</span> {participant.email}
                    </div>
                    <div>
                      <span className="font-semibold">Phone:</span> {participant.phone_number}
                    </div>
                    <div>
                      <span className="font-semibold">Birth Date:</span>{' '}
                      {new Date(participant.birth_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Paid Amount:</span> ${participant.paid_amount}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {participants.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
            </DialogTitle>
            <DialogDescription>
              {editingParticipant
                ? 'Update the participant details below.'
                : 'Fill in the participant details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tour_id">Tour</Label>
                <select
                  id="tour_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.tour_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tour_id: e.target.value })
                  }
                  disabled={!!editingParticipant}
                  required
                >
                  {tours.map((tour) => (
                    <option key={tour.id} value={tour.id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              </div>
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
              <Button type="submit">{editingParticipant ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
