"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MoreHorizontalIcon } from "lucide-react";
import { InstagramIcon, SnapchatIcon, TelegramIcon, WhatsappIcon } from "hugeicons-react";
import ProductCard from "@/components/custom/ProductCard";
import Categories from "@/components/custom/categories";


const categories = [
  "All",
  "Immune Support",
  "Digestive Health",
  "Heart Health",
  "Brain Function",
  "Joint Support",
  "Skin Care",
  "Energy Boost",
  "Sleep Aid",
];

const products = [
  {
    id: 1,
    name: "Natural HPV Treatment",
    price: 177.81,
    originalPrice: 213.38,
    category: "Immune Support",
  },
  {
    id: 2,
    name: "Diabetes Support Complex gjfgfjgj rjryrkry ryrykyrk rkyky",
    price: 157.81,
    originalPrice: 193.38,
    category: "Heart Health",
  },
  {
    id: 3,
    name: "Immune System Booster",
    price: 127.81,
    originalPrice: 163.38,
    category: "Immune Support",
  },
  {
    id: 4,
    name: "Cancer Support Formula",
    price: 197.81,
    originalPrice: 233.38,
    category: "Immune Support",
  },
  {
    id: 5,
    name: "Arthritis Relief Blend",
    price: 147.81,
    originalPrice: 183.38,
    category: "Joint Support",
  },
  {
    id: 6,
    name: "Memory Enhancer",
    price: 167.81,
    originalPrice: 203.38,
    category: "Brain Function",
  },
  {
    id: 7,
    name: "Natural Sleep Aid",
    price: 87.81,
    originalPrice: 123.38,
    category: "Sleep Aid",
  },
  {
    id: 8,
    name: "Digestive Enzyme Complex",
    price: 97.81,
    originalPrice: 133.38,
    category: "Digestive Health",
  },
];

export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-green-50 pt-16 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            NATURAL HEALING
            <br />
            <span className="text-green-600 font-extrabold">SOLUTIONS</span>
          </h1>
          <p className="text-gray-600 text-sm lg:text-base mb-8 max-w-2xl mx-auto">
            Discover nature's most powerful remedies for common health
            conditions. Our carefully selected natural solutions support your
            journey to wellness.
          </p>

          <Button
            variant="outline"
            className="bg-green-600 text-white text-xs shadow-lg"
          >
            S19H.O.E (Health Over Everything)
          </Button>

          <div className="socials flex justify-center items-center gap-x-6 mt-8">
            <a href="http://" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors ease-linear">
              <SnapchatIcon />
            </a>
            <a href="http://wa.me/+23781000" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors ease-linear">
              <WhatsappIcon />
            </a>
            <a href="http://" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors ease-linear">
              <TelegramIcon />
            </a>
            <a href="http://" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors ease-linear">
              <InstagramIcon />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className=" text-3xl lg:text-5xl font-bold text-center mt-6">
            Our <span className="text-green-600">Products</span>{" "}
          </h2>

         <Categories setSelectedCategory={setSelectedCategory} categories={categories} selectedCategory={selectedCategory} />
        </div>
      </section>

      {/* Product Grid */}
      <section className=" mt-8  lg:my-12 ">
        <div className="container mx-auto px-4 ">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* more items */}
          <div className="w-full flex justify-center items-center mt-8 ">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full">
              Load More <MoreHorizontalIcon />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
