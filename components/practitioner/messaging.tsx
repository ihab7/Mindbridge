"use client"

import React, { useState } from "react"
import { MessageThread } from "@/components/message-thread"
import { MessageCircle } from "lucide-react"

type Patient = {
  id: number
  name: string
  unread_count: number
}

export function PractitionerMessaging({
  currentUserId,
  patients,
  initialSelectedId,
}: {
  currentUserId: number
  patients: Patient[]
  initialSelectedId?: number
}) {
  const [selectedId, setSelectedId] = useState<number | undefined>(initialSelectedId || patients[0]?.id)

  const selectedPatient = patients.find((p) => p.id === selectedId)

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-96">
      {/* Patient List Sidebar */}
      <div className="hidden w-64 shrink-0 flex-col rounded-xl border border-border bg-card md:flex">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-card-foreground">Patients</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {patients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelectedId(patient.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                selectedId === patient.id
                  ? "bg-primary/10 text-primary"
                  : "text-card-foreground hover:bg-muted"
              }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{patient.name}</p>
              </div>
              {Number(patient.unread_count) > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {patient.unread_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile patient selector */}
      <div className="mb-2 md:hidden w-full">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground"
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} {Number(patient.unread_count) > 0 ? `(${patient.unread_count} unread)` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Message Thread */}
      <div className="flex-1">
        {selectedPatient ? (
          <MessageThread
            currentUserId={currentUserId}
            otherUserId={selectedPatient.id}
            otherUserName={selectedPatient.name}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card">
            <div className="text-center">
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select a patient to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
