import Head from 'next/head';

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Careers - EventNexus</title>
        <meta name="description" content="Join the EventNexus team" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">Join Our Team</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Help us build the future of event experiences
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">UI/UX Designer</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      Full-time
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Remote
                    </span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                      Design
                    </span>
                  </div>
                </div>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm">
                  Career Code: END-UIX-2023
                </span>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">About the Role</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We are looking for a creative UI/UX Designer to join our product team. You will be responsible for designing 
                  intuitive and beautiful interfaces that make event planning and attendance seamless for our users.
                </p>

                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                  <li>Design user flows, wireframes, and high-fidelity mockups</li>
                  <li>Conduct user research and usability testing</li>
                  <li>Collaborate with product managers and engineers</li>
                  <li>Maintain and evolve our design system</li>
                  <li>Create prototypes to validate design concepts</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                  <li>3+ years of UI/UX design experience</li>
                  <li>Strong portfolio showcasing your design process</li>
                  <li>Proficiency in Figma, Sketch, or similar tools</li>
                  <li>Understanding of front-end development (HTML/CSS)</li>
                  <li>Experience with design systems</li>
                </ul>

                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Nice to Have</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                  <li>Experience in event or ticketing platforms</li>
                  <li>Motion design skills</li>
                  <li>Illustration skills</li>
                </ul>

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3">How to Apply</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Interested in this position? Send your resume, portfolio, and the career code to:
                  </p>
                  <div className="text-center">
                    <a 
                      href="mailto:contact@eventnexu.in?subject=Application for UI/UX Designer (END-UIX-2023)" 
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
                    >
                      contact@eventnexu.in
                    </a>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Please include UI/UX Designer Application in the subject line
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-4">Do not see your dream job?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We are always looking for talented people to join our team. Send us your resume and tell us how you can contribute!
            </p>
            <a 
              href="mailto:contact@eventnexu.in?subject=General Application" 
              className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium py-3 px-6 rounded-lg transition"
            >
              Send General Application
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}