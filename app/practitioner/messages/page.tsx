import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"
import { redirect } from "next/navigation"
import { PractitionerMessaging } from "@/components/practitioner/messaging"

export default async function PractitionerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string }>
}) {
  const user = await getSession()
  if (!user) redirect("/login")

  const sql = getSql()

  const { patient: selectedPatientId } = await searchParams

  const patients = await sql`
    SELECT u.id, u.name,
      (SELECT COUNT(*) FROM messages m WHERE m.sender_id = u.id AND m.receiver_id = ${user.id} AND m.read = false) as unread_count
    FROM users u
    JOIN patients p ON p.user_id = u.id
    WHERE p.practitioner_id = ${user.id}
    ORDER BY u.name ASC
  `

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="mt-1 text-muted-foreground">
          Communicate with your patients
        </p>
      </div>
      <PractitionerMessaging
        currentUserId={user.id}
        patients={patients}
        initialSelectedId={selectedPatientId ? parseInt(selectedPatientId) : undefined}
      />
    </div>
  )
}
