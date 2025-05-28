"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useTransition } from "react"
import { updateUserProfile } from "./updateUserProfileAction"
import toast from "react-hot-toast"

const nameSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters")
})

type NameFormData = z.infer<typeof nameSchema>

interface NameEditFormProps {
  initialName: string
}

export function NameEditForm({ initialName }: NameEditFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentName, setCurrentName] = useState(initialName)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: initialName },
    mode: "onChange" // Enable real-time validation
  })

  const watchedName = watch("name")

  const onSubmit = (data: NameFormData) => {
    // Prevent submission if name hasn't changed
    if (data.name.trim() === currentName.trim()) {
      setIsEditing(false)
      return
    }

    startTransition(async () => {
      try {
        const result = await updateUserProfile(data)
        
        if (result?.error) {
          toast.error(result.error)
        } else {
          toast.success("Name updated successfully!")
          setCurrentName(data.name)
          setIsEditing(false)
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error("An unexpected error occurred. Please try again.")
      }
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset({ name: currentName })
  }

  const handleEdit = () => {
    setIsEditing(true)
    reset({ name: currentName })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-brand-light-gray">Name</h3>
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="flex items-center gap-2">
            <Input 
              {...register("name")}
              className="max-w-xs"
              disabled={isPending}
              placeholder="Enter your name"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={isPending || !isValid || watchedName?.trim() === currentName.trim()} 
              size="sm"
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-lg">{currentName || 'Not provided'}</p>
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            onClick={handleEdit}
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}