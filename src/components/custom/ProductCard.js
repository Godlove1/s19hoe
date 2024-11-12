"use client"
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "react-use-cart";


export default function ProductCard({ product }) {
  
  const { addItem, inCart } = useCart();

  return (
    <Card className="group relative">
      <CardContent className="p-4">
        <Link href={`/product/${product.id}`}>
          <Image
            src="/placeholder.svg"
            alt={product.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        </Link>
        <h3 className="font-semibold mb-2 md:line-clamp-1 ">{product.name}</h3>
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-green-600 font-bold">
              ${product.price.toFixed(2)}
            </span>
            {/* <span className="text-gray-400 line-through ml-2">
              ${product.originalPrice.toFixed(2)}
            </span> */}
          </div>
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            className={`w-full  ${
              inCart(product?.id)
                ? "bg-gray-700  text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={() => addItem(product)}
          >
            {inCart(product?.id) ? "In cart" : "Add to cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
