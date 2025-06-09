import Link from "next/link";

function FinalCtaSection() {
  return (
    <section className="px-6 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-white">
          Ready to Experience the Future of Monitoring?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of developers who trust DecentralWatch for their uptime
          monitoring needs.
        </p>
        <Link
          href={"/sign-in"}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white border-0 shadow-xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
        >
          Start Your Free Trial
        </Link>
      </div>
    </section>
  );
}

export default FinalCtaSection;
