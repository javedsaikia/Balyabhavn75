"use client"

import { Calendar, MapPin, Clock, CalendarDays, Grid3X3, Filter, Search } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EventsPage() {
  const router = useRouter()
  
  useEffect(() => {
    console.log('Events page loaded successfully')
    console.log('Current URL:', window.location.href)
  }, [])
  
  const handleRegisterClick = (eventId: number) => {
    router.push(`/register/${eventId}`)
  }

  const events = [
    {
      id: 1,
      title: "75th Anniversary Celebration Balya Bhavan",
      description: "Join us for a grand celebration of 75 years of excellence and memories.",
      date: "Sunday, 9th November",
      time: "9 AM - 6 PM",
      location: "Balya Bhavan",
      attendees: 250,
      maxAttendees: 300,
      image: "/anniversary-celebration-hall.png",
      status: "upcoming",
      featured: true,
      category: "celebration",
      version: "2024-updated",
    },
    {
      id: 2,
      title: "Alumni Reunion Lunch",
      description: "Reconnect with old friends and make new memories over a delicious lunch.",
      date: "Sunday, 9th November",
      time: "12:00 PM - 3:00 PM",
      location: "Balya Bhavan",
      attendees: 180,
      maxAttendees: 200,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Aug%2026%2C%202025%2C%2007_02_24%20PM-hUQnJehLbkZTLBkLE1jDWPZSkW2yiX.png",
      status: "upcoming",
      featured: false,
      category: "social",
      version: "2024-updated",
    },
    {
      id: 3,
      title: "Cultural Evening",
      description: "Experience traditional performances and cultural programs by alumni.",
      date: "Sunday, 9th November",
      time: "5:00 PM - 9:00 PM",
      location: "Balya Bhavan",
      attendees: 120,
      maxAttendees: 150,
      image: "/cultural-performance-stage.png",
      status: "upcoming",
      featured: false,
      category: "cultural",
      version: "2024-updated",
    },
    {
      id: 4,
      title: "Networking Mixer",
      description: "Connect with fellow alumni across different industries and build professional relationships.",
      date: "Sunday, 9th November",
      time: "7:00 PM - 10:00 PM",
      location: "Balya Bhavan",
      attendees: 95,
      maxAttendees: 100,
      image: "/new-networking-mixer.png",
      status: "upcoming",
      featured: false,
      category: "networking",
      version: "2024-updated",
    },
  ]

  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    return filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      if (sortBy === "attendees") {
        return b.attendees - a.attendees
      }
      return a.title.localeCompare(b.title)
    })
  }, [searchTerm, selectedCategory, sortBy])

  const featuredEvent = events.find((event) => event.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Diamond Anniversary
            <span className="block text-2xl md:text-3xl text-purple-300 font-normal mt-2">
              75 Years of Excellence
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent font-bold text-2xl block mb-2 animate-pulse">
              Balya Bhavan Jorhat
            </span>
            <span className="text-lg font-semibold text-white/90 block mb-1">
              75 Years of 
            </span>
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent font-bold text-xl">
              Shaping Minds, Touching Hearts
            </span>
          </p>
        </div>

        {featuredEvent && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-purple-400" />
              Featured Event
            </h2>
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/3 xl:w-2/5">
                  <div className="relative aspect-[3/2] lg:aspect-[4/5] xl:aspect-[3/2] overflow-hidden">
                    {featuredEvent.image.startsWith('http') || featuredEvent.image.startsWith('https') ? (
                      <Image
                        src={featuredEvent.image}
                        alt={featuredEvent.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 40vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        priority
                      />
                    ) : (
                      <img
                        src={featuredEvent.image}
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    )}
                  </div>
                </div>
                <div className="lg:w-2/3 xl:w-3/5 p-6 lg:p-8 xl:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-purple-600 text-white">
                      {featuredEvent.category}
                    </Badge>
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      {featuredEvent.status}
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{featuredEvent.title}</h3>
                  <p className="text-white/80 mb-6">{featuredEvent.description}</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>{featuredEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span>{featuredEvent.location}</span>
                    </div>
                  </div>

                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="celebration">Celebration</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="attendees">Popularity</SelectItem>
                <SelectItem value="title">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-purple-600 text-white" : "border-white/20 text-white hover:bg-white/10"}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className={viewMode === "calendar" ? "bg-purple-600 text-white" : "border-white/20 text-white hover:bg-white/10"}
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAndSortedEvents
            .filter((event) => !event.featured)
            .map((event) => (
              <Card key={event.id} className="bg-white/10 border-white/20 backdrop-blur-lg overflow-hidden hover:bg-white/15 transition-all duration-300">
                <div className="relative">
                  {event.image.startsWith('http') || event.image.startsWith('https') ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-purple-600 text-white">
                      {event.category}
                    </Badge>
                    <Badge variant="outline" className="border-green-400 text-green-400 bg-black/50">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join the Celebration?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Don't miss out on this historic celebration. Register for events, connect with fellow alumni, and be part of our diamond anniversary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              onClick={() => router.push('/register/1')}
            >
              Register for All Events
            </Button>
            <Link href="/profile">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent px-8 py-3">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}