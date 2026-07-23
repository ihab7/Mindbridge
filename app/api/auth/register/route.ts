export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const sql = getSql();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!["patient", "practitioner"].includes(role)) {
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

    const result = await sql`
      INSERT INTO users (role, name, email, password_hash)
      VALUES (${role}, ${name}, ${email}, ${passwordHash})
      RETURNING id, role, name, email
    `;

    const user = result[0];

    // If patient, assign to first available practitioner
    if (role === "patient") {
      const practitioners =
        await sql`SELECT id FROM users WHERE role = 'practitioner' LIMIT 1`;
      if (practitioners.length > 0) {
        await sql`INSERT INTO patients (user_id, practitioner_id) VALUES (${user.id}, ${practitioners[0].id})`;
      }
    }

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
