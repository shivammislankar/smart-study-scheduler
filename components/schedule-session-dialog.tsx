"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Bell } from "lucide-react"
import { useTopics } from "@/hooks/use-topics"
import type { ScheduledSession } from "@/lib/supabase"

interface ScheduleSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSchedule: (session: Omit<ScheduledSession, "id" | "created_at" | "updated_at">) => Promise<void>
  initialDate?: string
  initialTime?: string
}

export function ScheduleSessionDialog({
  open,
  onOpenChange,
  onSchedule,
  initialDate,
  initialTime,
}: ScheduleSessionDialogProps) {
  const { topics } = useTopics()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic_id: "",
    scheduled_date: initialDate || "",
    scheduled_time: initialTime || "09:00",
    duration_minutes: 25,
    session_type: "flashcard" as const,
    reminder_enabled: true,
    reminder_minutes: 15,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.topic_id || !formData.scheduled_date) return

    setIsSubmitting(true)
    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`)

      await onSchedule({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        topic_id: formData.topic_id,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: formData.duration_minutes,
        session_type: formData.session_type,
        reminder_enabled: formData.reminder_enabled,
        reminder_minutes: formData.reminder_minutes,
        status: "scheduled",
        user_id: "", // Will be set in the service
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        topic_id: "",
        scheduled_date: initialDate || "",
        scheduled_time: initialTime || "09:00",
        duration_minutes: 25,
        session_type: "flashcard",
        reminder_enabled: true,
        reminder_minutes: 15,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error scheduling session:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Study Session
            </DialogTitle>
            <DialogDescription>Plan your study session in advance and get reminders.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                placeholder="e.g., JavaScript Review Session"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Select
                value={formData.topic_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, topic_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
                        {topic.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration_minutes: Number.parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-type">Session Type</Label>
                <Select
                  value={formData.session_type}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, session_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flashcard">Flashcard Review</SelectItem>
                    <SelectItem value="quiz">Quiz Session</SelectItem>
                    <SelectItem value="review">General Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about what you want to focus on..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="reminder">Enable Reminder</Label>
                </div>
                <Switch
                  id="reminder"
                  checked={formData.reminder_enabled}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, reminder_enabled: checked }))}
                />
              </div>

              {formData.reminder_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Remind me</Label>
                  <Select
                    value={formData.reminder_minutes.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, reminder_minutes: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.topic_id || !formData.scheduled_date}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
