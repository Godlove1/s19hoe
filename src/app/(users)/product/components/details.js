"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";

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
import { CURRENCY, useFirestoreQuery } from "@/lib/firebaseHooks";
import { where } from "firebase/firestore";
import toast from "react-hot-toast";


export default function ProductPage({ item }) {
  // const {
  //   data: recommendedProducts,
  //   loading,
  //   error,
  // } = useFirestoreQuery("allProducts", [where("categoryId", "==", item?.categoryId)]);

  const { updateItemQuantity, getItem, inCart, addItem } = useCart();
  // Ensure item is defined and has the necessary properties
  const cartItem = getItem(item?.id);
  const currentQty = cartItem ? cartItem.quantity : 1;

  const incrementQty = () => {
    if (cartItem) {
      updateItemQuantity(item.id, currentQty + 1);
    } else {
      addItem(item, 1);
      toast.success(`${item?.name} added to cart`);
    }
  };

  const decrementQty = () => {
    if (cartItem && currentQty > 1) {
      updateItemQuantity(item.id, currentQty - 1);
    } else if (cartItem && currentQty === 1) {
      updateItemQuantity(item.id, 0); // This will remove the item from cart
    }
  };

  const productPics = item?.productPics || [];
  const name = item?.name || "Product Name";
  const price = item?.price || 0;

  
  return (
    <div className="p-4 lg:p-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images Carousel */}
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {productPics?.map((src, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={src}
                    alt={`${item?.name} - Image ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{name}</h1>
          {/* <p className="text-gray-600 mb-4">{product.category}</p> */}
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-green-600 mr-2">
              {CURRENCY?.sign}
              {price.toFixed(2)}
            </span>
            {/* <span className="text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span> */}
          </div>

          <div className="cta flex justify-start items-center my-8 gap-x-6">
            <div className="flex items-center ">
              <Button variant="outline" size="icon" onClick={decrementQty}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 text-xl font-semibold">{currentQty}</span>
              <Button variant="outline" size="icon" onClick={incrementQty}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => {
                addItem(item);
                toast.success(`${item?.name} added to cart`);
              }}
              className="w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />{" "}
              {inCart(item?.id) ? "Already in cart" : "Add to cart"}
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full my-6">
            <AccordionItem value="description">
              <AccordionTrigger>Product Description</AccordionTrigger>
              <AccordionContent>{item?.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>How to Use</AccordionTrigger>
              <AccordionContent>{item?.howToUse}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Recommended Products */}
      <section className="mt-16 md:mt-32 md:px-32">
        {/* <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>

        {loading &&
          recommendedProducts.length ===0 (
              <div className="flex items-center justify-center text-gray-400">
                {" "}
                loading recommendations
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
              </div>
            )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
          {recommendedProducts?.map((product, i) => (
            <ProductCard key={i} product={product} />
          ))}
        </div> */}
      </section>
    </div>
  );
}
