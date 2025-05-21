import Head from 'next/head';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>About Us - EventNexus</title>
        <meta name="description" content="Learn more about EventNexus - Your all-in-one event platform" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">About EventNexus</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing the event industry one ticket at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Founded in 2025, EventNexus began as a simple idea between friends frustrated with the fragmented event experience. 
              Why should organizers, attendees, and sponsors need multiple platforms to create the perfect event?
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We have grown from a small startup to a leading event platform, processing millions of tickets annually and 
              connecting thousands of organizers with their perfect audiences.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              To create seamless, end-to-end event experiences that delight organizers, attendees, and sponsors alike.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">The EventNexus Difference</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>All-in-one platform (ticketing, organizing, sponsorship)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Cutting-edge technology with human-centered design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>Transparent pricing with no hidden fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>24/7 customer support from real people</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Meet The Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Rashmi J V', role: 'Developer', funFact: 'Cloud 9 lunatic' },
              { name: 'Laxmi S Tangadi', role: 'Developer', funFact: 'Realist' },
            ].map((person, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="w-20 h-20 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                <h3 className="font-medium text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">{person.role}</p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">Fun fact: {person.funFact}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}