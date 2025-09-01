"use client"

import type React from "react"

import { useState } from "react"
import { User, Mail, Lock, Phone, MapPin, GraduationCap, Calendar, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterUserPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    batch: "",
    yearOfPassing: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess("Registration successful! You can now sign in with your credentials.")

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        batch: "",
        yearOfPassing: "",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">Alumni Registration</h1>
          <p className="text-white/70">Join the Balya Bhavan Alumni Network</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Create Your Alumni Account
            </CardTitle>
            <CardDescription className="text-white/70">
              Register to access events, connect with fellow alumni, and stay updated with institutional activities.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-300 mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 border-green-500/20 text-green-300 mb-6">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-white/20 pb-2">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white pr-10"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-white/20 pb-2">Academic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="batch" className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Batch
                    </Label>
                    <Input
                      id="batch"
                      type="text"
                      value={formData.batch}
                      onChange={(e) => handleInputChange("batch", e.target.value)}
                      className="bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                      placeholder="e.g., 1995-2000"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="yearOfPassing" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Year of Passing
                    </Label>
                    <Select
                      value={formData.yearOfPassing}
                      onValueChange={(value) => handleInputChange("yearOfPassing", value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-white/10">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>


              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90 active:bg-white/80 rounded-lg py-2 text-sm font-medium transition disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Alumni Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm mb-4">Already have an account?</p>
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
