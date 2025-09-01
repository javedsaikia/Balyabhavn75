"use client"

import { useState, useEffect } from "react"
import { User, Mail, Edit3, Camera, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"
import type { User as UserType } from "@/lib/auth"

export default function ProfilePage() {
  const [profilePhoto, setProfilePhoto] = useState<string>("/professional-profile.png")
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          router.push("/?error=authentication_required")
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Failed to load profile:", error)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndFetchProfile()
  }, [router])

  const handlePhotoEdit = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfilePhoto(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  if (isLoading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <Alert className="bg-red-500/10 border-red-500/20 text-red-300 max-w-md">
          <AlertDescription>Failed to load profile. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 ring-1 ring-white/10 flex bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Image
                  src="/images/balya-logo.png"
                  alt="Balya Bhavan Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">Alumni Profile</h1>
          <p className="text-white/70">Manage your profile and view your information</p>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300 mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/20">
                    <Image
                      src={profilePhoto || "/placeholder.svg"}
                      alt="Profile Photo"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={handlePhotoEdit}
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-white text-black hover:bg-white/90"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-white text-xl">{user.name}</CardTitle>
                <CardDescription className="text-white/70">
                  {user.batch ? `Batch: ${user.batch}` : "Alumni Member"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">ID: {user.id}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">{user.email}</span>
                  </div>
                  {user.department && (
                    <div className="flex items-center gap-3 text-sm">
                      <Edit3 className="w-4 h-4 text-white/60" />
                      <span className="text-white/80">{user.department}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePhotoEdit}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Photo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-white/70">Your academic and personal details</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-medium mb-2">Personal Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Full Name:</span>
                          <span className="text-white">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Email:</span>
                          <span className="text-white">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Phone:</span>
                            <span className="text-white">{user.phone}</span>
                          </div>
                        )}
                        {user.address && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Address:</span>
                            <span className="text-white">{user.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-white font-medium mb-2">Academic Information</h3>
                      <div className="space-y-2 text-sm">
                        {user.batch && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Batch:</span>
                            <span className="text-white">{user.batch}</span>
                          </div>
                        )}
                        {user.department && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Department:</span>
                            <span className="text-white">{user.department}</span>
                          </div>
                        )}
                        {user.yearOfPassing && (
                          <div className="flex justify-between">
                            <span className="text-white/60">Year of Passing:</span>
                            <span className="text-white">{user.yearOfPassing}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-white/60">Status:</span>
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : user.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                            }
                          >
                            {user.status || "Active"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-4">Want to register for events?</p>
                    <Link href="/events">
                      <Button className="bg-white text-black hover:bg-white/90">Browse Events</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8 gap-4">
          <Link href="/events">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          {user.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Admin Dashboard
              </Button>
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
