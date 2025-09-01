"use client"

import { useState, useEffect } from "react"
import {
  User,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Download,
  Printer,
  Home,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RegistrationData {
  name: string
  email: string
  address: string
  yearOfPassing: string
  attendance: string
  payForRegistration: string
  amount: string
  photo: string | null
  photoPath: string | null
  eventId: string
  eventTitle: string
  registrationId: string
  registrationDate: string
  paymentStatus: string
}

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadRegistrations = () => {
      try {
        const storedRegistrations = localStorage.getItem("registrations")
        if (storedRegistrations) {
          const parsedRegistrations = JSON.parse(storedRegistrations)
          setRegistrations(parsedRegistrations)
        }
      } catch (error) {
        console.error("Failed to load registrations:", error)
        setError("Failed to load registration data")
      } finally {
        setIsLoading(false)
      }
    }

    loadRegistrations()
  }, [])

  const handlePrint = (registration: RegistrationData) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">Registration Confirmation</h1>
          <div style="background: #10b981; color: white; padding: 10px; border-radius: 8px; display: inline-block;">
            <strong>Registration ID: ${registration.registrationId}</strong>
          </div>
        </div>
        
        <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Event Details</h2>
          <p><strong>Event:</strong> ${registration.eventTitle}</p>
          <p><strong>Registration Date:</strong> ${new Date(registration.registrationDate).toLocaleDateString()}</p>
        </div>
        
        <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Personal Information</h2>
          <p><strong>Name:</strong> ${registration.name}</p>
          <p><strong>Email:</strong> ${registration.email}</p>
          <p><strong>Address:</strong> ${registration.address}</p>
          <p><strong>Year of Passing:</strong> ${registration.yearOfPassing}</p>
          <p><strong>Attendance Type:</strong> ${registration.attendance}</p>
        </div>
        
        <div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Payment Information</h2>
          <p><strong>Payment Required:</strong> ${registration.payForRegistration === 'yes' ? 'Yes' : 'No'}</p>
          ${registration.amount ? `<p><strong>Amount:</strong> ₹${registration.amount}</p>` : ''}
          <p><strong>Payment Status:</strong> ${registration.paymentStatus}</p>
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleSavePDF = (registration: RegistrationData) => {
    // For now, we'll use the print functionality as PDF save
    // In a real implementation, you'd use a library like jsPDF
    alert("PDF functionality would be implemented with a library like jsPDF. For now, please use the print option.")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white/70">Loading your registrations...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Data</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-white text-black hover:bg-white/90">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">No Registrations Found</h2>
            <p className="text-white/70 mb-6">
              You haven't registered for any events yet. Browse our upcoming events to get started.
            </p>
            <Link href="/events">
              <Button className="bg-white text-black hover:bg-white/90">
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        {/* Success Banner */}
        <Alert className="mb-8 bg-green-500/10 border-green-500/20">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <strong>Registration Successful!</strong>
                <p className="text-sm mt-1">
                  Your registration has been submitted. Payment confirmation may take 24-48 hours to process.
                </p>
              </div>

            </div>
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">My Registrations</h1>
          <p className="text-white/70 text-lg">
            View and manage your event registrations
          </p>
        </div>

        {/* Registrations List */}
        <div className="space-y-8">
          {registrations.map((registration, index) => (
            <Card key={registration.registrationId} className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white text-xl">{registration.eventTitle}</CardTitle>
                    <CardDescription className="text-white/70">
                      Registered on {new Date(registration.registrationDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(registration.paymentStatus)}>
                    {registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Unique ID Section */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-white font-semibold">Registration ID</h3>
                      <p className="text-blue-200 font-mono text-lg">{registration.registrationId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg border-b border-white/20 pb-2">
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Full Name</p>
                          <p className="text-white">{registration.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Email</p>
                          <p className="text-white">{registration.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-white/60 mt-1" />
                        <div>
                          <p className="text-white/60 text-sm">Address</p>
                          <p className="text-white">{registration.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Year of Passing</p>
                          <p className="text-white">{registration.yearOfPassing}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Attendance Type</p>
                          <p className="text-white capitalize">{registration.attendance}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg border-b border-white/20 pb-2">
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Payment Required</p>
                          <p className="text-white">{registration.payForRegistration === 'yes' ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      {registration.amount && (
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-white/60" />
                          <div>
                            <p className="text-white/60 text-sm">Amount</p>
                            <p className="text-white font-semibold text-lg">₹{registration.amount}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Payment Method</p>
                          <p className="text-white">UPI / Bank Transfer</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Transaction Reference</p>
                          <p className="text-white font-mono">{registration.registrationId.replace('REG-', 'TXN-')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Status</p>
                          <Badge className={getStatusColor(registration.paymentStatus)}>
                            {registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Section */}
                {registration.photo && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg border-b border-white/20 pb-2">
                      Uploaded Photo
                    </h3>
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white/20">
                        <Image
                          src={registration.photo}
                          alt="Registration photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/20">
                  <Button
                    onClick={() => handlePrint(registration)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Confirmation
                  </Button>
                  <Button
                    onClick={() => handleSavePDF(registration)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save as PDF
                  </Button>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Return to Homepage
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="bg-white text-black hover:bg-white/90">
                      <User className="w-4 h-4 mr-2" />
                      Account Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8 gap-4">
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