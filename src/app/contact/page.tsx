import Head from "next/head";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Contact Us - EventNexus</title>
        <meta name="description" content="Get in touch with EventNexus" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">Contact Us</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            We would love to hear from you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Send us a message</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option>General Inquiry</option>
                  <option>Event Support</option>
                  <option>Sponsorship</option>
                  <option>Press</option>
                  <option>Careers</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition"
              >
                Send Message
              </button>
            </div>
          </div>

          <div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-xl mb-8">
              <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">Email Us Directly</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Prefer to send an email directly? Here are our main contact addresses:
              </p>
              <ul className="space-y-3">
                <li>
                  <span className="font-medium text-gray-800 dark:text-gray-200">General Inquiries:</span>{" "}
                  <a href="mailto:contact@eventnexu.in" className="text-blue-600 dark:text-blue-400 hover:underline">
                    contact@eventnexu.in
                  </a>
                </li>
                
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Our Office</h3>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">Address:</span> KLE Technological Universtiy, HUbballi, Karnataka 580032
                </p>
                <p>
                  <span className="font-medium">Phone:</span> +91 8217676356
                </p>
                <p>
                  <span className="font-medium">Hours:</span> Monday - Friday, 9AM - 6PM
                </p>
              </div>

              <div className="mt-6 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg">
                {/* Map placeholder */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}