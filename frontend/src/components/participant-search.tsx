import { useState, useRef, useEffect, useCallback } from 'react'
import { participantsService } from '@/services/participants'
import type { Participant } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface ParticipantSearchProps {
  onSelect: (participant: Participant) => void
}

export function ParticipantSearch({ onSelect }: ParticipantSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Participant[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }
    setIsLoading(true)
    try {
      const data = await participantsService.search(q)
      setResults(data)
      setIsOpen(data.length > 0)
    } catch {
      setResults([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  const handleSelect = (participant: Participant) => {
    onSelect(participant)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="participant-search">Search existing participants</Label>
      <div className="relative mt-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="participant-search"
          placeholder="Type a name to search..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-9"
          autoComplete="off"
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
          ) : (
            <ul className="max-h-48 overflow-y-auto py-1">
              {results.map((p) => (
                <li
                  key={p.id}
                  className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(p)}
                >
                  {p.name} {p.surname} &mdash; {p.phone_number}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
