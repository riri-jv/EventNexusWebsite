import Head from "next/head";

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Blog - EventNexus</title>
        <meta name="description" content="EventNexus blog - Stories from behind the scenes" />
      </Head>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mt-6 text-gray-900 dark:text-white">EventNexus Blog</h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Stories from behind the scenes of building an event platform
          </p>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-12">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="p-8">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span>May 20, 2025</span>
              <span className="mx-2">•</span>
              <span>5 min read</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              The Sleepless Nights of Building EventNexus
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
              A humorous look at the trials and tribulations of creating an event platform from scratch
            </p>

            <div className="prose dark:prose-invert max-w-none">
              <p>
                It all started with an innocent idea: &#34;Wouldn&#39;t it be great if there was one platform that could handle everything for events?&#34; 
                Famous last words. Little did we know we were signing up for countless sleepless nights, questionable amounts of coffee, 
                and an intimate relationship with our IDEs that might be considered unhealthy by normal standards.
              </p>

              <h3>The Great Database Debate</h3>
              <p>
                Our first challenge came when we had to choose a database. SQL? NoSQL? NewSQL? We spent two weeks debating this, 
                only to realize we hadn&#39;t even named our company yet. After heated discussions that nearly ended friendships, 
                we settled on MongoDB and Primsa - mostly because Laxmi facinated the prisms.
              </p>

              <h3>The Feature Creep Monster</h3>
              <p>
                &#34;While we&#39;re at it, we should probably add...&#34; became the most dangerous phrase in our vocabulary. 
                What started as a simple ticketing platform soon had features for virtual reality event spaces, 
                AI-powered matchmaking between sponsors and organizers, and a blockchain-based loyalty program 
                (that last one was Alex&#39;s idea after watching a YouTube video at 2 AM). NOT IMPLEMENTING THEM.
              </p>

              

              <h3>The Design Dilemma</h3>
              <p>
                &#34;Make it pop!&#34; - the most terrifying words for any developer. Our designer, Rashmi, would present 
                beautiful mockups that we&#39;d then implement with all the grace of a toddler finger-painting. 
                After the third iteration of &#34;Can we make the buttons more... joyful?&#34; we seriously considered 
                just making everything hot pink and calling it a day.
              </p>

              <h3>The Light at the End of the Tunnel</h3>
              <p>
                Despite the challenges (and the alarming amount of energy drinks consumed), seeing our first real 
                event go live made it all worthwhile. Sure, we all haven&#39;t got notifications for every ticket. But soon to come.
              </p>

              <p>
                So here we are, still standing (mostly), still coding (constantly), and still passionate about 
                making EventNexus the best event platform out there. And if you ever see us with bloodshot eyes 
                at a tech meetup, just know we are probably thinking about database optimizations.
              </p>

              <p className="font-bold mt-8">
                To all the developers out there pulling all-nighters for your passion projects - we see you, 
                we feel you, and we highly recommend investing in a good coffee machine.
              </p>
            </div>
          </div>
        </article>

        
      </main>
    </div>
  );
}