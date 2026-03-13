"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const AuthSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignupSchema = AuthSchema.extend({
  fullName: z.string().optional()
});

export async function login(formData: FormData) {
  const supabase = await createClient()

  const parsed = AuthSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName")
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName || "",
      }
    }
  })

  // In Supabase, typical defaults require email confirmation.
  // We'll proceed as if it might succeed right away or need confirmation.  
  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath("/")
  redirect("/login")
}

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, role: "NORMAL" }

  // Query profiles table to get the role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return { 
    user, 
    role: profile?.role || "NORMAL", 
    isAdmin: profile?.role === "ADMIN" 
  }
}
