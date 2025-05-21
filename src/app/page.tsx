import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { SignInButton } from '@clerk/nextjs';
import { SignUpButton } from '@clerk/nextjs';

export default async function Page() {
  const user = await currentUser();

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ">
            Discover Amazing Events Near You
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
            From concerts and conferences to workshops and meetups, find your next unforgettable experience with EventNexus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/events">
                <Button size="lg" className="px-8">
                  Browse Events
                </Button>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8">
                    Get Started
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="px-8">
                    Sign In
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-900 rounded-xl my-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <CalendarIcon className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Events</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover thousands of events happening near you or online.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <TicketIcon className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Secure your spot in just a few clicks with our simple booking system.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <UsersIcon className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Meet like-minded people and grow your professional network.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Events</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Event cards would go here */}
          <EventCard />
          <EventCard />
          <EventCard />
        </div>
        <div className="text-center mt-8">
          <Link href="/events">
            <Button variant="outline">
              View All Events
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function EventCard() {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 dark:bg-gray-800"></div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">Event Name</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Location • Date</p>
        <Button size="sm" className="w-full">
          Book Now
        </Button>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

 
function TicketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

 
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}