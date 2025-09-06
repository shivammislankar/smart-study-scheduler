"use client"

import type React from "react"

import { useState } from "react"
import { Plus, BookOpen, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loading } from "@/components/ui/loading"
import { useTopics } from "@/hooks/use-topics"
import { getRandomTopicColor } from "@/lib/utils"
import Link from "next/link"

export default function TopicsPage() {
  const { topics, loading, error, createTopic, deleteTopic } = useTopics()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTopic, setNewTopic] = useState({
    name: "",
    description: "",
    color: getRandomTopicColor(),
  })

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.name.trim()) return

    setIsCreating(true)
    try {
      await createTopic({
        name: newTopic.name.trim(),
        description: newTopic.description.trim() || undefined,
        color: newTopic.color,
        user_id: "", // This will be set in the hook
      })
      setNewTopic({ name: "", description: "", color: getRandomTopicColor() })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create topic:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (confirm("Are you sure you want to delete this topic? This will also delete all associated flashcards.")) {
      try {
        await deleteTopic(topicId)
      } catch (error) {
        console.error("Failed to delete topic:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loading size="lg" />
          <p className="text-muted-foreground">Loading your topics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error loading topics: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
          <p className="text-muted-foreground">
            Organize your study materials by topic. You have {topics.length} topics.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTopic}>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogDescription>Add a new topic to organize your study materials.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Topic Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., JavaScript Fundamentals"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this topic..."
                    value={newTopic.description}
                    onChange={(e) => setNewTopic((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTopic.color === color ? "border-gray-900" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTopic((prev) => ({ ...prev, color }))}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newTopic.name.trim()}>
                  {isCreating ? "Creating..." : "Create Topic"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Add flashcards to see count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered Cards</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Complete study sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No cards due yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topic.color }} />
                  <div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    {topic.description && <CardDescription className="mt-1">{topic.description}</CardDescription>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Topic
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTopic(topic.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Topic
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 total cards</span>
                <span>0 mastered</span>
              </div>

              <div className="text-sm text-muted-foreground">
                Created {new Date(topic.created_at).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/topics/${topic.id}`}>Add Cards</Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href={`/dashboard/topics/${topic.id}`}>View Cards</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Topic Card */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent
            className="flex flex-col items-center justify-center h-full min-h-[200px] text-center"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-8 w-8 text-gray-400 mb-2" />
            <h3 className="font-medium text-gray-900 mb-1">Add New Topic</h3>
            <p className="text-sm text-gray-500">Create a new topic to organize your flashcards</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
            <p className="text-gray-600 mb-4">Create your first topic to start organizing your study materials.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Topic
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
