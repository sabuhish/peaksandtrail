import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder }: DateTimePickerProps) {
  const [time, setTime] = React.useState<string>('12:00')

  React.useEffect(() => {
    if (value) {
      setTime(format(value, 'HH:mm'))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined)
      return
    }

    const [hours, minutes] = time.split(':')
    selectedDate.setHours(parseInt(hours), parseInt(minutes))
    onChange(selectedDate)
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (value) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(value)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP HH:mm') : <span>{placeholder || 'Pick a date'}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={value} onSelect={handleDateSelect} initialFocus />
        <div className="p-3 border-t">
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
