import React, { Suspense } from "react"
import { ProgramPageClient } from "@/components/program/program-page-client"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProgramPageClient />
    </Suspense>
  )
}
