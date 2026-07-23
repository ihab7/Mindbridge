import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { MessageThread } from "@/components/message-thread"

export default async function PatientMessagesPage() {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  // Get practitioner for this patient
  const practitioner = await sql`
    SELECT u.id, u.name FROM users u
    JOIN patients p ON p.practitioner_id = u.id
    WHERE p.user_id = ${user.id}
    LIMIT 1
  `

  if (practitioner.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">No practitioner assigned yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="mt-1 text-muted-foreground">
          Chat with {practitioner[0].name}
        </p>
      </div>
      <MessageThread
        currentUserId={user.id}
        otherUserId={practitioner[0].id}
        otherUserName={practitioner[0].name}
      />
    </div>
  )
}
