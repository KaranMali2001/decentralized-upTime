import { Activity } from "lucide-react";
import Link from "next/link";
function Header() {
  return (
    <header className="px-6 py-4 border-b border-purple-500/20 backdrop-blur-sm">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            DecentralWatch
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#testimonials"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Reviews
          </a>
          <a
            href="#about"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-gray-300 hover:text-purple-400 transition-colors"
          >
            Contact
          </a>
          <Link
            href={"/sign-in"}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0 shadow-lg shadow-purple-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
