"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LiveSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (term) => {
    setIsLoading(true);
    setError(null);
    try {
      const productsRef = collection(db, "allProducts");
      const searchQuery = query(
        productsRef,
        where("status", "==", "ON"),
        orderBy("searchName"),
        startAt(term.toLowerCase()),
        endAt(term.toLowerCase() + "\uf8ff")
      );

      const querySnapshot = await getDocs(searchQuery);

      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSearchResults(results);
      if (results.length === 0) {
        setError("No products found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="relative mt-2">
        <Input
          type="search"
          placeholder="Search remedies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-full text-sm placeholder:text-sm"
          aria-label="Search remedies"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
          aria-hidden="true"
        />
      </div>

      <AnimatePresence>
        <div className="absolute left-0 right-0 mt-2 z-10">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center items-center p-4 bg-white border rounded-md shadow-lg"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-600">Searching...</span>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>NotFound</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {searchResults.length > 0 && !isLoading && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border rounded-md shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto"
            >
              {searchResults.map((remedy, index) => (
                <motion.li
                  key={remedy.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b last:border-b-0"
                >
                  <Link
                    href={`/product/${remedy.id}`}
                    className="block px-4 py-3 hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    <h3 className="font-semibold text-primary">
                      {remedy.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {remedy.description}
                    </p>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
