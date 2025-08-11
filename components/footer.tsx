import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="text-lg font-semibold font-sora">
          <a 
            href="https://zarta.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            Zarta
          </a>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <div className="text-sm text-gray-500 mt-4 md:mt-0 text-center">
          <div>© {new Date().getFullYear()} Zarta. All rights reserved.</div>
          <div className="mt-1">
            Made by{" "}
            <a 
              href="https://codenies-new.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Codenies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
