import Link from "next/link";

// import { Client } from "appwrite";

// const client = new Client();
// client.setProject("6734a90d000c4c9f738e");

export default function Footer() {
  return (
    <footer className="bg-green-50 py-4 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
          <div>
            <h3 className="font-semibold text-lg mb-2">About Us</h3>
            <p className="text-sm text-gray-600">
              S19HOE is dedicated to providing natural remedies for a healthier
              life.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
            <ul className="space-y-2 lg:flex justify-between items-center">
              <li>
                <Link
                  href="/products"
                  className="text-sm underline text-gray-600 hover:text-green-600"
                >
                  19hoe@gmail.com
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm underline text-gray-600 hover:text-green-600"
                >
                  Join telegram group
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm underline text-gray-600 hover:text-green-600"
                >
                  Snapchat
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm underline text-gray-600 hover:text-green-600"
                >
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>
          {/* <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-600 hover:text-green-600"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div> */}
          {/* <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-2">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-3 py-2 text-sm border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Subscribe
              </button>
            </form>
          </div> */}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-600">
            &copy; 2024 S19HOE. All rights reserved.
          </p>
           <p className="text-xs text-gray-300">
           Designed by <a href="http://wa.me/+237676579370" target="_blank" className="font-bold" rel="noopener noreferrer">👑KyngKale</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
