import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toursService } from '@/services/tours'
import type { Tour, TourCreate } from '@/types'
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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Eye, ArrowLeft } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

export default function Tours() {
  const { toast } = useToast()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 20
  const [formData, setFormData] = useState<TourCreate>({
    name: '',
    plan: '',
    start_date: '',
    end_date: '',
    guides: '',
    info: '',
  })

  useEffect(() => {
    loadTours()
  }, [currentPage])

  const loadTours = async () => {
    try {
      setIsLoading(true)
      const skip = (currentPage - 1) * itemsPerPage
      const data = await toursService.getAll(skip, itemsPerPage)
      setTours(data)
      setHasMore(data.length === itemsPerPage)
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTour(null)
    setFormData({
      name: '',
      plan: '',
      start_date: '',
      end_date: '',
      guides: '',
      info: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour)
    setFormData({
      name: tour.name,
      plan: tour.plan,
      start_date: tour.start_date,
      end_date: tour.end_date,
      guides: tour.guides,
      info: tour.info || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await toursService.delete(id)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Tour deleted successfully.',
        })
        await loadTours()
      } catch (error) {
        // Error is handled by axios interceptor
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTour) {
        await toursService.update(editingTour.id, formData)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Tour updated successfully.',
        })
      } else {
        await toursService.create(formData)
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Tour created successfully.',
        })
      }
      setIsDialogOpen(false)
      await loadTours()
    } catch (error) {
      // Error is handled by axios interceptor
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Tours</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Tour
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading...</div>
      ) : tours.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No tours yet. Create your first tour!</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {tours.map((tour) => (
              <Card key={tour.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{tour.name}</CardTitle>
                      <CardDescription>
                        {new Date(tour.start_date).toLocaleDateString()} -{' '}
                        {new Date(tour.end_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/tours/${tour.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" onClick={() => handleEdit(tour)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(tour.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
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
                        <span className="font-semibold">Info:</span>
                        <div className="prose prose-sm max-w-none mt-1">
                          <ReactMarkdown>{tour.info}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tours.length > 0 && (
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
            <DialogTitle>{editingTour ? 'Edit Tour' : 'Create New Tour'}</DialogTitle>
            <DialogDescription>
              {editingTour
                ? 'Update the tour details below.'
                : 'Fill in the details to create a new tour.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tour Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan">Tour Plan</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.plan}
                    onChange={(value) => setFormData({ ...formData, plan: value || '' })}
                    preview="edit"
                    height={300}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guides">Guides</Label>
                <Input
                  id="guides"
                  value={formData.guides}
                  onChange={(e) => setFormData({ ...formData, guides: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="info">Additional Info (Optional)</Label>
                <div data-color-mode="light">
                  <MDEditor
                    value={formData.info}
                    onChange={(value) => setFormData({ ...formData, info: value || '' })}
                    preview="edit"
                    height={200}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingTour ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
