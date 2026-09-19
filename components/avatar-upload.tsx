"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2 } from "lucide-react"
import { useT } from "@/components/i18n-provider"
import { UserAvatar } from "@/components/user-avatar"
import {
  AVATAR_ACCEPTED_TYPES,
  AVATAR_ERROR_KEYS,
  AVATAR_MAX_INPUT_BYTES,
  AVATAR_MAX_STORED_BYTES,
  AVATAR_OUTPUT_SIZE,
} from "@/lib/avatars-shared"

/**
 * Centre-crops to a square and scales down to at most 512 px with the
 * browser's own canvas (no dependency). WebP first, JPEG when the browser
 * can't encode WebP, lowering quality until it fits the stored-size limit.
 * Throws "unreadable" when the file isn't a decodable image — e.g. a PDF
 * renamed to .jpg.
 */
async function compressToSquare(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error("unreadable")
  }
  const side = Math.min(bitmap.width, bitmap.height)
  const out = Math.min(AVATAR_OUTPUT_SIZE, side)
  const canvas = document.createElement("canvas")
  canvas.width = out
  canvas.height = out
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("unreadable")
  // White base so transparent PNGs don't turn black in the JPEG fallback.
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, out, out)
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, out, out)
  bitmap.close()

  const attempts: [string, number][] = [
    ["image/webp", 0.85],
    ["image/webp", 0.7],
    ["image/jpeg", 0.85],
    ["image/jpeg", 0.7],
    ["image/jpeg", 0.5],
  ]
  for (const [type, quality] of attempts) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
    // toBlob silently falls back to PNG for types it can't encode — skip those.
    if (blob && blob.type === type && blob.size <= AVATAR_MAX_STORED_BYTES) return blob
  }
  throw new Error("too_large")
}

type Draft = { blob: Blob; previewUrl: string }

export function AvatarUpload({
  name,
  initialAvatarUrl,
  endpoint,
}: {
  name: string
  initialAvatarUrl: string | null
  endpoint: "/api/practitioner/avatar" | "/api/patient/avatar"
}) {
  const t = useT()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [current, setCurrent] = useState<string | null>(initialAvatarUrl)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState<"processing" | "saving" | "removing" | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  // Release the preview's object URL when it is replaced or on unmount.
  useEffect(() => () => { if (draft) URL.revokeObjectURL(draft.previewUrl) }, [draft])

  function pick() {
    setError("")
    setNotice("")
    inputRef.current?.click()
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-picking the same file
    if (!file) return
    setError("")
    setNotice("")
    if (!(AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setError(t("avatar.errors.type"))
      return
    }
    if (file.size > AVATAR_MAX_INPUT_BYTES) {
      setError(t("avatar.errors.tooLarge"))
      return
    }
    setBusy("processing")
    try {
      const blob = await compressToSquare(file)
      setDraft({ blob, previewUrl: URL.createObjectURL(blob) })
    } catch (err) {
      setError(t(err instanceof Error && err.message === "too_large" ? "avatar.errors.tooLarge" : "avatar.errors.unreadable"))
    } finally {
      setBusy(null)
    }
  }

  async function save() {
    if (!draft) return
    setBusy("saving")
    setError("")
    try {
      const body = new FormData()
      body.append("file", draft.blob, draft.blob.type === "image/webp" ? "avatar.webp" : "avatar.jpg")
      const res = await fetch(endpoint, { method: "PUT", body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const key = AVATAR_ERROR_KEYS[data.errorCode as keyof typeof AVATAR_ERROR_KEYS] ?? "avatar.errors.uploadFailed"
        setError(t(key))
        return
      }
      setCurrent(data.avatarUrl)
      setDraft(null)
      setNotice(t("avatar.saved"))
      router.refresh() // server-rendered avatars elsewhere pick up the new photo
    } catch {
      setError(t("avatar.errors.uploadFailed"))
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    setBusy("removing")
    setError("")
    setNotice("")
    try {
      const res = await fetch(endpoint, { method: "DELETE" })
      if (!res.ok) {
        setError(t("avatar.errors.uploadFailed"))
        return
      }
      setCurrent(null)
      setNotice(t("avatar.removed"))
      router.refresh()
    } catch {
      setError(t("avatar.errors.uploadFailed"))
    } finally {
      setBusy(null)
    }
  }

  const shown = draft?.previewUrl ?? current

  return (
    <section aria-labelledby="avatar-upload-title" className="mb-card flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={pick}
        disabled={busy !== null}
        aria-label={t("avatar.change")}
        className="group relative h-24 w-24 shrink-0 self-center rounded-full outline-none ring-ring focus-visible:ring-2 disabled:cursor-wait sm:self-auto"
      >
        <UserAvatar
          src={shown}
          name={name}
          className="h-24 w-24 bg-primary/10 text-3xl font-semibold text-primary"
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy === "processing" ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </span>
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h2 id="avatar-upload-title" className="text-base font-semibold text-foreground">
          {t("avatar.title")}
        </h2>
        <p className="text-xs text-muted-foreground">{draft ? t("avatar.previewNote") : t("avatar.hint")}</p>

        <div className="flex flex-wrap items-center gap-2">
          {draft ? (
            <>
              <button
                type="button"
                onClick={save}
                disabled={busy !== null}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
                {busy === "saving" ? t("avatar.saving") : t("avatar.save")}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                disabled={busy !== null}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t("avatar.cancel")}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={pick}
                disabled={busy !== null}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {current ? t("avatar.change") : t("avatar.choose")}
              </button>
              {current && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy !== null}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
                >
                  {busy === "removing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t("avatar.remove")}
                </button>
              )}
            </>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {!error && notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPTED_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onFileChosen}
      />
    </section>
  )
}
