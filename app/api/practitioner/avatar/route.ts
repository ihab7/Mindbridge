export const runtime = "nodejs"

import { handleAvatarDelete, handleAvatarGetOwn, handleAvatarPut } from "@/lib/avatar-handlers"

// The signed-in practitioner's own profile photo. See lib/avatar-handlers.ts.
export const GET = () => handleAvatarGetOwn("practitioner")
export const PUT = (request: Request) => handleAvatarPut(request, "practitioner")
export const DELETE = () => handleAvatarDelete("practitioner")
