"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "react-use-cart";

export default function Cart() {

  const { isEmpty,cartTotal,  items, removeItem } =
    useCart();
  
  if (isEmpty) return (
    <div className="w-full flex justify-center items-center mt-20">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle className="text-green-600">Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-center font-semibold">Your cart is empty.</p>
        </CardContent>
      </Card>
    </div>
  );


  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 p-4 pt-8 md:px-52 md:pt-16">
        <div className="">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Your Cart</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b"
                >
                  <div>
                    <h3 className="font-medium text-sm lg:text-base text-wrap">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium ">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <div className="w-full mt-4">
                <div className="flex justify-between items-center text-sm w-full border-b pb-1 ">
                  <span className="font-medium">Sub-total:</span>
                  <span className="">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm my-3 w-full pb-1 border-b">
                  <span className="font-medium">Shipping fee:</span>
                  <span className="">${200}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="font-semibold">Total :</span>
                  <span className="font-bold text-lg">
                    ${cartTotal.toFixed(2) + 200}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Checkout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <Input id="name" placeholder="Your full name" />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="Your phone number(preferably whatsapp)"
                  />
                </div>
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Delivery Address
                  </label>
                  <Textarea id="address" placeholder="Your delivery address" />
                </div>
                <div>
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Special Note (Optional)
                  </label>
                  <Textarea id="note" placeholder="Any special instructions" />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Place Order
              </Button>
            </CardFooter>
          </Card>
          <p className="mt-4 text-xs text-center italic text-gray-500">
            All customer data is private and secure. We will never share your
            information with any third party.
          </p>
        </div>
      </div>
    </>
  );
}
