import { InstagramIcon, SnapchatIcon, TelegramIcon, WhatsappIcon } from "hugeicons-react";
import Link from "next/link";



export default function Footer() {
  return (
    <footer className="bg-green-50 py-4 pt-6 lg:pt-16 mt-16">
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
            <div className="flex items-center justify-start lg:justify-center gap-x-3">
              <h3 className="font-semibold text-lg ">Contact us :</h3>
              <div className="socials flex justify-center font-bold items-center gap-x-6 ">
                <a
                  href="http://"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors ease-linear"
                >
                  <SnapchatIcon />
                </a>
                <a
                  href="http://wa.me/+23781000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors ease-linear"
                >
                  <WhatsappIcon />
                </a>
                <a
                  href="http://"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors ease-linear"
                >
                  <TelegramIcon />
                </a>
                <a
                  href="http://"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-600 transition-colors ease-linear"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-600">
            &copy; 2024 S19HOE. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Designed by{" "}
            <a
              href="http://wa.me/+237676579370"
              target="_blank"
              className="font-bold underline"
              rel="noopener noreferrer"
            >
              👑KyngKale
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
