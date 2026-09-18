export const runtime = "nodejs"

import { handleAvatarDelete, handleAvatarGetOwn, handleAvatarPut } from "@/lib/avatar-handlers"

// The signed-in patient's own profile photo. See lib/avatar-handlers.ts.
export const GET = () => handleAvatarGetOwn("patient")
export const PUT = (request: Request) => handleAvatarPut(request, "patient")
export const DELETE = () => handleAvatarDelete("patient")
