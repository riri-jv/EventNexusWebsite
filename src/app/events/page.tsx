'use client'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card'
import { SearchIcon, FilterIcon, CalendarIcon, MapPinIcon } from 'lucide-react'
import { AnimatedDiv, AnimatedH1, AnimatedP } from '../../components/animated'
import { staggerContainer, fadeIn } from '../../lib/motion'

export default function EventsPage() {
  // This would be replaced with real data fetching
  const events = [
    {
      id: 1,
      title: 'Tech Conference 2023',
      date: 'Oct 15, 2023',
      location: 'San Francisco, CA',
      category: 'Conference',
      image: '/placeholder-event.jpg',
    },
    {
      id: 2,
      title: 'Music Festival',
      date: 'Nov 20, 2023',
      location: 'Los Angeles, CA',
      category: 'Concert',
      image: '/placeholder-event.jpg',
    },
    {
      id: 3,
      title: 'Design Workshop',
      date: 'Dec 5, 2023',
      location: 'New York, NY',
      category: 'Workshop',
      image: '/placeholder-event.jpg',
    },
  ]

  return (
    <AnimatedDiv
      initial="hidden"
      animate="show"
      variants={staggerContainer(0.1, 0.2)}
      className="min-h-[calc(100vh-5rem)]"
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Animated Header */}
        <AnimatedDiv variants={fadeIn('up', 'spring', 0.2, 1)} className="mb-8">
          <AnimatedH1 
            variants={fadeIn('up', 'spring', 0.2, 1)}
            className="text-3xl font-bold mb-2"
          >
            Browse Events
          </AnimatedH1>
          <AnimatedP 
            variants={fadeIn('up', 'spring', 0.4, 1)}
            className="text-gray-600 dark:text-gray-400"
          >
            Find your next unforgettable experience
          </AnimatedP>
        </AnimatedDiv>

        {/* Search and Filters */}
        <AnimatedDiv 
          variants={fadeIn('up', 'spring', 0.6, 1)}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              className="pl-10"
            />
          </div>
          <Select>
            <SelectTrigger className="w-[180px]">
              <FilterIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="conference">Conferences</SelectItem>
              <SelectItem value="concert">Concerts</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="sf">San Francisco</SelectItem>
              <SelectItem value="ny">New York</SelectItem>
              <SelectItem value="la">Los Angeles</SelectItem>
            </SelectContent>
          </Select>
        </AnimatedDiv>

        {/* Events Grid */}
        <AnimatedDiv
          variants={staggerContainer(0.1, 0.3)}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event, index) => (
            <AnimatedDiv
              key={event.id}
              variants={fadeIn('up', 'spring', index * 0.1, 0.75)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </AnimatedDiv>
          ))}
        </AnimatedDiv>
      </div>
    </AnimatedDiv>
  )
}