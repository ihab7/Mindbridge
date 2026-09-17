export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { createPatientWithCode, isUniqueViolation, normalizeCode } from "@/lib/linking/codes";

export async function POST(request: Request) {
  try {
    const sql = getSql();
    const { name, email, password, role, linkingCode } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Practitioner accounts are created only through /join, which writes the
    // login and the directory listing together. Accepting the role here would
    // recreate an account with no listing.
    if (role === "practitioner") {
      return NextResponse.json(
        { error: "Practitioner accounts are created at /join", redirect: "/join" },
        { status: 400 },
      );
    }

    if (role !== "patient") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // A patient is attached to a practitioner ONLY through a linking code the
    // practitioner generated (lib/linking/codes.ts) — never automatically.
    // With a code: account + link are created together, or nothing is (an
    // invalid code creates no account, so the patient can correct it).
    // Without one: a plain account with no `patients` row; the patient can
    // enter a code later from their dashboard.
    if (normalizeCode(linkingCode) !== "") {
      const linked = await createPatientWithCode(sql, { name, email, passwordHash, code: linkingCode });
      if (!linked.ok) {
        return NextResponse.json({ errorCode: linked.error }, { status: 400 });
      }
      await createSession(linked.user.id);
      return NextResponse.json(
        { user: linked.user, practitionerName: linked.practitionerName },
        { status: 201 },
      );
    }

    const result = await sql`
      INSERT INTO users (role, name, email, password_hash)
      VALUES (${role}, ${name}, ${email}, ${passwordHash})
      RETURNING id, role, name, email
    `;

    const user = result[0];

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    // Same email registered between the check above and the insert.
    if (isUniqueViolation(error, "users_email_key")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
