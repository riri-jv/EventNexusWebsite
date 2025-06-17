import Head from "next/head";

const faqs = [
  {
    question: "What is EventNexus?",
    answer: "EventNexus is an all-in-one event platform that combines ticketing, event organization, and sponsorship management into a single seamless experience. We help organizers create amazing events, attendees discover and book tickets easily, and sponsors connect with their ideal audiences."
  },
  {
    question: "How do I create an event?",
    answer: "Creating an event is simple! Sign up for an organizer account, click 'Create Event', and follow our step-by-step wizard. You can set ticket types, pricing, dates, and more. Our platform guides you through the entire process."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and in some regions, local payment methods. All payments are processed securely through our PCI-compliant payment gateway."
  },
  {
    question: "Can I get a refund for my ticket?",
    answer: "Refund policies are set by the event organizers. When purchasing tickets, you'll see the organizer's refund policy clearly displayed. If you need a refund, please contact the organizer directly through our platform."
  },
  {
    question: "How do sponsors connect with events?",
    answer: "Sponsors can browse events looking for sponsorship or be matched automatically based on their target audience and event demographics. Our smart matching algorithm suggests the best sponsorship opportunities for each sponsor's goals."
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes! EventNexus has iOS and Android apps available for attendees to discover and manage events. Organizers can use our mobile-friendly website or download our dedicated organizer app for managing events on the go."
  },
  {
    question: "What fees do you charge?",
    answer: "Our pricing is transparent with no hidden fees. For attendees, we charge a small service fee (clearly displayed before checkout). For organizers, we offer flexible pricing plans including a free tier with basic features and premium plans with advanced capabilities."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach our 24/7 customer support team through the 'Help' section in your account, by emailing support@eventnexu.in, or via live chat during business hours. We typically respond within 2 hours for urgent issues."
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>FAQ - EventNexus</title>
        <meta name="description" content="Frequently asked questions about EventNexus" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">Frequently Asked Questions</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions about EventNexus
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <button className="w-full px-6 py-4 text-left focus:outline-none">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</h2>
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
              <div className="px-6 pb-4">
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-4">Still have questions?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can&#39;t find what you&#39;re looking for? Our support team is happy to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}