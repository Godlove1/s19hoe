"use client";

import { useState } from "react";
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
import toast from "react-hot-toast";
import { CURRENCY, useFirestoreCRUD } from "@/lib/firebaseHooks";

export default function Cart() {
  const { isEmpty, cartTotal, totalUniqueItems, emptyCart, items, removeItem } =
    useCart();
  const { addDocument } = useFirestoreCRUD("allOrders");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim())
      newErrors.address = "Delivery address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const orderData = {
        ...formData,
        cartItems: items,
        itemCount: totalUniqueItems,
        cartTotal: cartTotal + 200, // Including shipping fee
        orderDate: new Date(),
        status: "pending",
      };

      await toast.promise(addDocument(orderData), {
        loading: "Processing your order...",
        success: "Order placed successfully!",
        error: "Failed to place order",
      });

      emptyCart();
      setFormData({
        name: "",
        phone: "",
        address: "",
        note: "",
      });
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="w-full flex justify-center items-center mt-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center font-semibold">Your cart is empty.</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              variant="outline"
              className="text-green-600"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 p-4 pt-8 md:px-52 md:pt-16">
      <div>
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
                  <h3 className="font-medium text-sm lg:text-base text-wrap">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {CURRENCY?.sign}
                    {(item.price * item.quantity).toLocaleString()}
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
              <div className="flex justify-between items-center text-sm w-full border-b pb-1">
                <span className="font-medium">Sub-total:</span>
                <span>
                  {" "}
                  {CURRENCY?.sign}
                  {cartTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm my-3 w-full pb-1 border-b">
                <span className="font-medium">Shipping fee:</span>
                <span>{CURRENCY?.sign}200</span>
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">
                  {CURRENCY?.sign}
                  {(cartTotal + 200).toLocaleString()}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name*
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number*
                </label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number (preferably WhatsApp)"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Delivery Address*
                </label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Your delivery address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700"
                >
                  Special Note (Optional)
                </label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Any special instructions"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-xs text-center italic text-gray-500">
          All customer data is private and secure. We will never share your
          information with any third party.
        </p>
      </div>
    </div>
  );
}
