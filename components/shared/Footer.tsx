import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-4">RentNest</h3>
            <p className="text-sm text-gray-600">Find and list rental properties with ease.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/properties" className="hover:text-blue-600">Browse Properties</Link></li>
              <li><Link href="/auth/register" className="hover:text-blue-600">List Property</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} RentNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
}