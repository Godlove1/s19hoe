"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductCard from "@/components/custom/ProductCard";
import { useCart } from "react-use-cart";


// Mock product data (in a real app, this would come from an API or database)
const product = {
  id: 1,
  name: "Natural HPV Treatment",
  price: 177.81,
  originalPrice: 213.38,
  category: "Immune Support",
  description:
    "Our Natural HPV Treatment is a powerful blend of herbs and nutrients designed to support your body's natural defenses against HPV (Human Papillomavirus). This unique formula combines the strength of traditional herbal remedies with modern nutritional science to provide comprehensive immune support.",
  usage:
    "Take 2 capsules twice daily with meals, or as directed by your healthcare practitioner. For best results, use consistently for at least 3-6 months. Always consult with a healthcare professional before starting any new supplement regimen, especially if you have any pre-existing medical conditions or are taking medications.",
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ],
};

const recommendedProducts = [
  {
    id: 2,
    name: "Immune System Booster",
    price: 127.81,
    originalPrice: 163.38,
  },
  {
    id: 3,
    name: "Digestive Enzyme Complex",
    price: 97.81,
    originalPrice: 133.38,
  },
  {
    id: 4,
    name: "Cancer Support Formula",
    price: 197.81,
    originalPrice: 233.38,
  },
  {
    id: 5,
    name: "Arthritis Relief Blend",
    price: 147.81,
    originalPrice: 183.38,
  },
  { id: 6, name: "Memory Enhancer", price: 167.81, originalPrice: 203.38 },
];

export default function ProductPage({ item }) {
  
  const { updateItemQuantity, getItem, addItem } = useCart();

  // Get the item from cart if it exists
  const cartItem = getItem(item.id);
  const currentQty = cartItem ? cartItem.quantity : 1;

  const incrementQty = () => {
    if (cartItem) {
      // If item exists in cart, increment its quantity
      updateItemQuantity(item.id, currentQty + 1);
    } else {
      // If item doesn't exist in cart, add it with quantity 1
      addItem(item, 1);
    }
  };

  const decrementQty = () => {
    if (cartItem && currentQty > 1) {
      // If item exists in cart and quantity > 1, decrement
      updateItemQuantity(item.id, currentQty - 1);
    } else if (cartItem && currentQty === 1) {
      // If quantity is 1, you might want to remove the item
      updateItemQuantity(item.id, 0); // This will remove the item from cart
    }
  };

  return (
    <div className="p-4 lg:p-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {product.images.map((src, index) => (
              <CarouselItem key={index}>
                <Image
                  src={src}
                  alt={`${product.name} - Image ${index + 1}`}
                  width={500}
                  height={500}
                  className="w-full rounded-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.category}</p>
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-green-600 mr-2">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          </div>

          <div className="cta flex justify-start items-center my-8 gap-x-6">
            <div className="flex items-center ">
              <Button variant="outline" size="icon" onClick={decrementQty}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 text-xl font-semibold">
                {currentQty}
              </span>
              <Button variant="outline" size="icon" onClick={incrementQty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => addItem(product)}
              className="w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full my-6">
            <AccordionItem value="description">
              <AccordionTrigger>Product Description</AccordionTrigger>
              <AccordionContent>{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>How to Use</AccordionTrigger>
              <AccordionContent>{product.usage}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Recommended Products */}
      <section className="mt-16 md:mt-32 md:px-32">
        <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product?.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
