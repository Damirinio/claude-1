"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  from: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    from: formData.get("from") ?? undefined,
  });

  if (!parsed.success) {
    redirect("/login?error=invalide");
  }

  const { email, password, from } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.actif) {
    redirect("/login?error=identifiants");
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    redirect("/login?error=identifiants");
  }

  await createSession(user.id);
  await logAudit({ userId: user.id, action: "CONNEXION", entityType: "USER", entityId: user.id });

  const target = from && from.startsWith("/") ? from : "/";
  redirect(target);
}
