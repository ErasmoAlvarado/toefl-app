"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: formData.get("fullName") as string || "",
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
