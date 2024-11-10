"use client";

import {
  ShoppingCart,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useCart } from "react-use-cart";

export default function Header() {

  const { totalUniqueItems } = useCart();

  
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto p-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-green-700">
             <Image src="/icons/logo.png" alt="Logo" width={80} height={80} priority className="lg:w-[100] lg:h-[100]" /></Link>
            

            {/* Search */}
            <div className="md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="search remedies..."
                  className="w-full pl-8 pr-2 py-2 border text-sm rounded-full placeholder:text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-4 pr-3">
              <Link href="/cart" className="p-2 relative">
                <ShoppingCart className="h-6 w-6" />
                {totalUniqueItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalUniqueItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
      
    </>
  );
}
