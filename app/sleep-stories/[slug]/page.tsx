import React from "react"
import { redirect } from "next/navigation"
import { StoryPlayer } from "@/components/sleep-stories/StoryPlayer"
import { getStoryBySlug } from "@/lib/sleep-stories/stories"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = getStoryBySlug(slug)

  if (!story) redirect("/sleep-stories")

  return <StoryPlayer story={story} />
}
