"use client"

import type React from "react"

import { useState } from "react"
import {
  User,
  Mail,
  Upload,
  Calendar,
  ArrowLeft,
  MapPin,
  GraduationCap,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

const eventDetails = {
  1: { title: "75th Anniversary Celebration Balya Bhavan", date: "Sunday, 9th November, 2025" },
  2: { title: "Alumni Reunion Lunch", date: "March 16, 2025" },
  3: { title: "Cultural Evening", date: "March 17, 2025" },
  4: { title: "Sports Tournament", date: "March 18, 2025" },
}

export default function RegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const event = eventDetails[parseInt(eventId) as keyof typeof eventDetails]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    yearOfPassing: "",
    attendance: "",
    payForRegistration: "",
    amount: "",
    photo: null as File | null,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Format currency input
  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "")
    
    // Ensure only one decimal point
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("")
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2)
    }
    
    return numericValue
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value
    
    // Apply currency formatting for amount field
    if (field === "amount") {
      processedValue = formatCurrency(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({ ...prev, photo: "Photo size must be less than 5MB" }))
        return
      }

      setFormData((prev) => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Clear photo error if exists
      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: "" }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please provide a complete address"
    }

    if (!formData.yearOfPassing) {
      newErrors.yearOfPassing = "Year of passing is required"
    } else {
      const year = Number.parseInt(formData.yearOfPassing)
      if (year < 1950 || year > 2025) {
        newErrors.yearOfPassing = "Please enter a valid year between 1950 and 2025"
      }
    }

    if (!formData.attendance) {
      newErrors.attendance = "Please select an attendance type"
    }

    if (!formData.payForRegistration) {
      newErrors.payForRegistration = "Please select whether you will pay for registration"
    }

    // Validate amount if payment is required
    if (formData.payForRegistration === "yes") {
      if (!formData.amount.trim()) {
        newErrors.amount = "Amount is required when paying for registration"
      } else {
        const amount = parseFloat(formData.amount.replace(/[^\d.]/g, ""))
        if (isNaN(amount) || amount <= 0) {
          newErrors.amount = "Please enter a valid amount greater than 0"
        } else if (amount < 100) {
          newErrors.amount = "Minimum amount is ₹100"
        } else if (amount > 50000) {
          newErrors.amount = "Maximum amount is ₹50,000"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      console.log("[v0] Submitting registration data:", formData)

      let photoUrl = null
      let photoPath = null

      // Upload photo if provided
      if (formData.photo) {
        console.log("[v0] Uploading photo to Supabase storage...")
        
        const photoFormData = new FormData()
        photoFormData.append('photo', formData.photo)
        photoFormData.append('userId', `reg-${Date.now()}`)

        const uploadResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: photoFormData
        })

        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          photoUrl = uploadResult.data.url
          photoPath = uploadResult.data.path
          console.log("[v0] Photo uploaded successfully:", photoUrl)
        } else {
          console.error("[v0] Photo upload failed:", uploadResult.error)
          setErrors((prev) => ({ ...prev, photo: uploadResult.error || "Photo upload failed" }))
          setSubmitStatus("error")
          return
        }
      }

      // Simulate network delay for registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create registration data with photo URL
      const registrationData = {
        ...formData,
        photo: photoUrl, // Store the Supabase URL instead of File object
        photoPath, // Store the storage path for potential deletion
        eventId,
        eventTitle: event.title,
        registrationId: `REG-${Date.now()}`,
        registrationDate: new Date().toISOString(),
        paymentStatus: "pending",
      }

      console.log("[v0] Registration successful:", registrationData)

      // Store registration data in localStorage for demo purposes
      const existingRegistrations = JSON.parse(localStorage.getItem("registrations") || "[]")
      existingRegistrations.push(registrationData)
      localStorage.setItem("registrations", JSON.stringify(existingRegistrations))

      setSubmitStatus("success")
    } catch (error) {
      console.error("[v0] Registration failed:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      yearOfPassing: "",
      attendance: "",
      photo: null,
    })
    setPhotoPreview(null)
    setErrors({})
    setSubmitStatus("idle")
  }

  if (!event) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
            <Link href="/events">
              <Button className="bg-white text-black hover:bg-white/90">Back to Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitStatus === "success") {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
            <p className="text-white/70 mb-6">
              Your registration for <strong>{event.title}</strong> has been submitted successfully. Please complete the
              payment to confirm your registration.
            </p>
            <div className="space-y-3">
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Register for Another Event
              </Button>
              <Link href="/my-registrations">
                <Button className="w-full bg-white text-black hover:bg-white/90">View My Registrations</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
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
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">Event Registration</h1>
          <p className="text-white/70">
            Register for: <span className="text-white font-medium">{event.title}</span>
          </p>
          <p className="text-white/60 text-sm">
            <Calendar className="w-4 h-4 inline mr-1" />
            {event.date}
          </p>
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg inline-block">
            <p className="text-amber-200 font-semibold">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Registration Fee: ₹1,000
            </p>
            <p className="text-amber-200/80 text-sm mt-1">
              ₹500 for Post-2018 Passouts
            </p>
          </div>
        </div>

        {submitStatus === "error" && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Registration failed. Please check your information and try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white">Registration Details</CardTitle>
              <CardDescription className="text-white/70">
                Please fill in your information to complete registration
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2 text-white">
                    <User className="w-4 h-4" />
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white ${errors.name ? "border-red-500/50" : ""}`}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-white">
                    <Mail className="w-4 h-4" />
                    Email Address <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white ${errors.email ? "border-red-500/50" : ""}`}
                    placeholder="Enter your email address"
                    required
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2 text-white">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white min-h-[80px] ${errors.address ? "border-red-500/50" : ""}`}
                    placeholder="Enter your complete address"
                    required
                  />
                  {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfPassing" className="text-sm font-medium flex items-center gap-2 text-white">
                    <GraduationCap className="w-4 h-4" />
                    Year of Passing <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="yearOfPassing"
                    type="number"
                    min="1950"
                    max="2025"
                    value={formData.yearOfPassing}
                    onChange={(e) => handleInputChange("yearOfPassing", e.target.value)}
                    className={`bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white ${errors.yearOfPassing ? "border-red-500/50" : ""}`}
                    placeholder="e.g., 2020"
                    required
                  />
                  {errors.yearOfPassing && <p className="text-red-400 text-sm">{errors.yearOfPassing}</p>}
                </div>

                {/* Attendance Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Attendance Type <span className="text-red-400">*</span></Label>
                  <Select onValueChange={(value) => handleInputChange("attendance", value)}>
                    <SelectTrigger
                      className={`bg-white/10 border-white/20 text-white ${errors.attendance ? "border-red-500/50" : ""}`}
                    >
                      <SelectValue placeholder="Select attendance type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="full-event" className="text-white hover:bg-white/10">
                        Full Event Attendance
                      </SelectItem>
                      <SelectItem value="partial" className="text-white hover:bg-white/10">
                        Partial Attendance
                      </SelectItem>
                      <SelectItem value="virtual" className="text-white hover:bg-white/10">
                        Virtual Attendance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.attendance && <p className="text-red-400 text-sm">{errors.attendance}</p>}
                </div>

                {/* Pay for Registration Radio Buttons */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-white">
                    <CreditCard className="w-4 h-4" />
                    Pay for the Registration <span className="text-red-400">*</span>
                  </Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="radio"
                          id="pay-yes"
                          name="payForRegistration"
                          value="yes"
                          checked={formData.payForRegistration === "yes"}
                          onChange={(e) => handleInputChange("payForRegistration", e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                            formData.payForRegistration === "yes"
                              ? "border-white bg-white"
                              : "border-white/40 bg-transparent hover:border-white/60"
                          } ${errors.payForRegistration ? "border-red-500/50" : ""}`}
                          onClick={() => handleInputChange("payForRegistration", "yes")}
                        >
                          {formData.payForRegistration === "yes" && (
                            <div className="w-2 h-2 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <Label
                        htmlFor="pay-yes"
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleInputChange("payForRegistration", "yes")}
                      >
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="radio"
                          id="pay-no"
                          name="payForRegistration"
                          value="no"
                          checked={formData.payForRegistration === "no"}
                          onChange={(e) => handleInputChange("payForRegistration", e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                            formData.payForRegistration === "no"
                              ? "border-white bg-white"
                              : "border-white/40 bg-transparent hover:border-white/60"
                          } ${errors.payForRegistration ? "border-red-500/50" : ""}`}
                          onClick={() => handleInputChange("payForRegistration", "no")}
                        >
                          {formData.payForRegistration === "no" && (
                            <div className="w-2 h-2 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <Label
                        htmlFor="pay-no"
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleInputChange("payForRegistration", "no")}
                      >
                        No
                      </Label>
                    </div>
                  </div>
                  {errors.payForRegistration && <p className="text-red-400 text-sm">{errors.payForRegistration}</p>}
                </div>

                {/* Amount Input - Conditional */}
                {formData.payForRegistration === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2 text-white">
                      <CreditCard className="w-4 h-4" />
                      Amount in Rupees <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm font-medium">
                        ₹
                      </span>
                      <Input
                        type="text"
                        id="amount"
                        placeholder="Enter amount (e.g., 5000.00)"
                        value={formData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                        className={`pl-8 bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white ${
                          errors.amount ? "border-red-500/50" : ""
                        }`}
                        required
                      />
                    </div>
                    {errors.amount && <p className="text-red-400 text-sm">{errors.amount}</p>}
                    <p className="text-white/60 text-xs">
                      Enter amount between ₹100 and ₹50,000. Only numbers and decimal points are allowed.
                    </p>
                  </div>
                )}

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-sm font-medium flex items-center gap-2 text-white">
                    <Upload className="w-4 h-4" />
                    Profile Photo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className={`bg-white/10 border-white/20 text-white file:bg-white/20 file:border-0 file:text-white file:rounded-md file:px-3 file:py-1 ${errors.photo ? "border-red-500/50" : ""}`}
                      />
                    </div>
                    {photoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden ring-2 ring-white/20">
                        <Image
                          src={photoPreview || "/placeholder.svg"}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {errors.photo && <p className="text-red-400 text-sm">{errors.photo}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black hover:bg-white/90 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting Registration..." : "Complete Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white">Payment Information</CardTitle>
              <CardDescription className="text-white/70">Complete your payment to confirm registration</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Registration Fee */}
              <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h3 className="text-xl font-bold text-amber-200 mb-2">Registration Fee</h3>
                <p className="text-3xl font-bold text-white">₹1,000</p>
              </div>
              <div className="text-center mt-2">
                <p className="text-sm text-white/80">₹500 for Post-2018 Passouts</p>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <h4 className="text-white font-semibold mb-4">Scan & Pay</h4>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%207.18.06%20PM-txvVKch52BvHKnL8kkTAiMyKX8IfhK.jpeg"
                      alt="Payment QR Code"
                      width={280}
                      height={350}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Bank Transfer Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Bank Name:</span>
                    <span className="text-white">State Bank of India (SBI), Jorhat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Account Name:</span>
                    <span className="text-white">Maharajat Jayan Udjapan Samiti</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Account Number:</span>
                    <span className="text-white font-mono">43719247149</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">IFSC Code:</span>
                    <span className="text-white font-mono">SBIN0000104</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-200 font-semibold mb-2">Payment Instructions</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Scan the QR code using any UPI app</li>
                  <li>• Or transfer ₹1,000 to the bank account above</li>
                  <li>• Keep the payment receipt for verification</li>
                  <li>• Registration will be confirmed after payment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Link href="/events">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
