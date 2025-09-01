import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { getSupabaseClient, supabaseAdmin, isSupabaseConnected } from './supabase'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set')
}

export interface User {
  id: string
  unique_id?: string
  email: string
  name: string
  role: "user" | "admin"
  batch?: string
  department?: string
  phone?: string
  address?: string
  yearOfPassing?: string
  registrationDate?: string
  status?: "active" | "pending" | "suspended"
}

export interface Admin {
  id: string
  unique_id?: string
  email: string
  name: string
  role: "admin"
}

const users: (User | Admin)[] = [
  {
    id: "admin-1",
    email: "admin@balyabhavan.edu",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "user-1",
    email: "rajesh.kumar@example.com",
    name: "Rajesh Kumar",
    role: "user",
    batch: "1995-2000",
    department: "Computer Science",
    phone: "+91 98765 43210",
    address: "Jorhat, Assam",
    yearOfPassing: "2000",
    registrationDate: "2025-01-15",
    status: "active",
  },
]

// Mock password storage - replace with real database
// Adding fallback passwords for testing when Supabase is not available
const passwords: Record<string, string> = {
  "admin@balyabhavan.edu": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
  "rajesh.kumar@example.com": "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
}

export const REGISTRATION_CAPACITY = 1000

// Supabase Authentication Functions
export async function authenticateWithSupabase(email: string, password: string): Promise<User | Admin | null> {
  if (!isSupabaseConnected()) {
    return null
  }

  try {
    // Sign in with Supabase Auth
    const supabaseClient = getSupabaseClient()
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      return null
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      return null
    }

    return {
      id: userData.id,
      unique_id: userData.unique_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      batch: userData.batch,
      department: userData.department,
      phone: userData.phone,
      address: userData.address,
      yearOfPassing: userData.year_of_passing,
      registrationDate: userData.registration_date,
      status: userData.status
    } as User | Admin
  } catch (error) {
    console.error('Supabase authentication error:', error)
    return null
  }
}

export async function registerWithSupabase(userData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  batch?: string
  department?: string
  yearOfPassing?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!isSupabaseConnected()) {
    return { success: false, error: 'Supabase connection not available' }
  }

  try {
    // Check capacity
    const { data: statsData } = await supabaseAdmin.rpc('get_registration_stats')
    if (statsData?.isCapacityFull) {
      return { success: false, error: 'Registration capacity reached. Maximum 1000 users allowed.' }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create user account' }
    }

    // Generate unique ID
    const { data: uniqueIdData, error: uniqueIdError } = await supabaseAdmin.rpc('generate_unique_user_id')
    if (uniqueIdError || !uniqueIdData) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: 'Failed to generate unique ID' }
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        unique_id: uniqueIdData,
        email: userData.email,
        name: userData.name,
        role: 'user',
        phone: userData.phone,
        address: userData.address,
        batch: userData.batch,
        department: userData.department,
        year_of_passing: userData.yearOfPassing,
        status: 'active'
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: 'Failed to create user profile' }
    }

    return {
      success: true,
      user: {
        id: profileData.id,
        unique_id: profileData.unique_id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role,
        batch: profileData.batch,
        department: profileData.department,
        phone: profileData.phone,
        address: profileData.address,
        yearOfPassing: profileData.year_of_passing,
        registrationDate: profileData.registration_date,
        status: profileData.status
      } as User
    }
  } catch (error) {
    console.error('Supabase registration error:', error)
    return { success: false, error: 'Registration failed. Please try again.' }
  }
}

export async function getSupabaseRegistrationStats(): Promise<{
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  availableSlots: number;
  capacity: number;
  isCapacityFull: boolean;
}> {
  if (!isSupabaseConnected()) {
    return getRegistrationStats() // Fallback to in-memory stats
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('get_registration_stats')
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching Supabase stats:', error)
    return getRegistrationStats() // Fallback
  }
}

export async function getAllSupabaseUsers(): Promise<(User | Admin)[]> {
  if (!isSupabaseConnected()) {
    return getAllUsers() // Fallback to in-memory users
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      batch: user.batch,
      department: user.department,
      phone: user.phone,
      address: user.address,
      yearOfPassing: user.year_of_passing,
      registrationDate: user.registration_date,
      status: user.status
    })) as (User | Admin)[]
  } catch (error) {
    console.error('Error fetching Supabase users:', error)
    return getAllUsers() // Fallback
  }
}

export async function updateSupabaseUserStatus(userId: string, status: "active" | "pending" | "suspended"): Promise<boolean> {
  if (!isSupabaseConnected()) {
    return updateUserStatus(userId, status) // Fallback
  }

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Error updating Supabase user status:', error)
    return false
  }
}

export async function getRegistrationStats() {
  // Try Supabase first
  if (isSupabaseConnected()) {
    return await getSupabaseRegistrationStats()
  }
  
  // Fallback to in-memory stats
  const totalUsers = users.filter((u) => u.role === "user").length
  const activeUsers = users.filter((u) => u.role === "user" && (u as User).status === "active").length
  const pendingUsers = users.filter((u) => u.role === "user" && (u as User).status === "pending").length
  const suspendedUsers = users.filter((u) => u.role === "user" && (u as User).status === "suspended").length
  const availableSlots = REGISTRATION_CAPACITY - totalUsers

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    suspendedUsers,
    availableSlots,
    capacity: REGISTRATION_CAPACITY,
    isCapacityFull: totalUsers >= REGISTRATION_CAPACITY,
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function signJWT(payload: any): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 24 * 60 * 60, // 24 hours
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(jwtPayload))
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)

    // Check expiration
    if (payload.exp && payload.exp < now) {
      console.log("[v0] JWT expired")
      return null
    }

    return payload
  } catch (error) {
    console.log("[v0] JWT verification failed, returning null")
    return null
  }
}

export async function registerUser(userData: {
  name: string
  email: string
  password: string
  phone?: string
  address?: string
  batch?: string
  department?: string
  yearOfPassing?: string
}): Promise<{ success: boolean; user?: User; error?: string }> {
  // Try Supabase registration first
  if (isSupabaseConnected()) {
    return await registerWithSupabase(userData)
  }

  // Fallback to in-memory registration
  try {
    // Check if registration is at capacity
    const stats = await getRegistrationStats()
    if (stats.isCapacityFull) {
      return { success: false, error: "Registration capacity reached. Maximum 1000 users allowed." }
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, error: "User with this email already exists." }
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Generate unique user ID
    const userId = `ALM-${new Date().getFullYear()}-${String(stats.totalUsers + 1).padStart(3, "0")}`

    // Create new user
    const newUser: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: "user",
      phone: userData.phone,
      address: userData.address,
      batch: userData.batch,
      department: userData.department,
      yearOfPassing: userData.yearOfPassing,
      registrationDate: new Date().toISOString().split("T")[0],
      status: "active",
    }

    // Add to users array (in production, save to database)
    users.push(newUser)
    passwords[userData.email] = hashedPassword

    return { success: true, user: newUser }
  } catch (error) {
    return { success: false, error: "Registration failed. Please try again." }
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | Admin | null> {
  // Try Supabase authentication first
  if (isSupabaseConnected()) {
    const supabaseUser = await authenticateWithSupabase(email, password)
    if (supabaseUser) {
      return supabaseUser
    }
  }

  // Fallback to in-memory authentication
  const user = users.find((u) => u.email === email)
  if (!user) return null

  const hashedPassword = passwords[email]
  if (!hashedPassword) return null

  const isValid = await verifyPassword(password, hashedPassword)
  if (!isValid) return null

  return user
}

export async function getCurrentUser(): Promise<User | Admin | null> {
  try {
    // Try Supabase first if connected
    if (isSupabaseConnected()) {
      const supabaseClient = getSupabaseClient()
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      
      if (session?.user && !error) {
        // Get user profile from our users table
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile && !profileError) {
          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            batch: profile.batch,
            department: profile.department,
            phone: profile.phone,
            address: profile.address,
            yearOfPassing: profile.year_of_passing,
            registrationDate: profile.registration_date,
            status: profile.status,
          } as User | Admin
        }
      }
    }
    
    // Fallback to JWT authentication
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = await verifyJWT(token)
    if (!payload) return null

    const user = users.find((u) => u.id === payload.userId)
    return user || null
  } catch (error) {
    console.log("[v0] getCurrentUser error:", error)
    return null
  }
}

export async function getAllUsers(): Promise<(User | Admin)[]> {
  // Try Supabase first
  if (isSupabaseConnected()) {
    return await getAllSupabaseUsers()
  }
  
  // Fallback to in-memory users
  return users
}

export async function updateUserStatus(userId: string, status: "active" | "pending" | "suspended"): Promise<boolean> {
  // Try Supabase first
  if (isSupabaseConnected()) {
    return await updateSupabaseUserStatus(userId, status)
  }
  
  // Fallback to in-memory update
  const userIndex = users.findIndex((u) => u.id === userId && u.role === "user")
  if (userIndex === -1) return false
  ;(users[userIndex] as User).status = status
  return true
}

export async function setAuthCookie(user: User | Admin): Promise<void> {
  try {
    const token = await signJWT({ userId: user.id, role: user.role })
    const cookieStore = cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Always false for demo purposes
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    console.log("[v0] Auth cookie set successfully for:", user.email)
  } catch (error) {
    console.log("[v0] Failed to set auth cookie:", error)
    throw error
  }
}

export async function clearAuthCookie(): Promise<void> {
  try {
    const cookieStore = cookies()
    cookieStore.delete("auth-token")
  } catch (error) {
    console.log("[v0] Failed to clear auth cookie:", error)
  }
}

export function isAdmin(user: User | Admin | null): user is Admin {
  return user?.role === "admin"
}

export function isUser(user: User | Admin | null): user is User {
  return user?.role === "user"
}
