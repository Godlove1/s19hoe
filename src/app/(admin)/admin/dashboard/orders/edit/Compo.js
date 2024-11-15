"use client"

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { CURRENCY, useFirestoreCRUD, useFirestoreDoc } from "@/lib/firebaseHooks";
import Loading from "@/app/(users)/loading";
import toast from "react-hot-toast";

const OrderCard = ({editId}) => {

 
  const {
    data: orderData,
    loading,
    error,
  } = useFirestoreDoc("allOrders", editId);

  const { updateDocument } = useFirestoreCRUD("allOrders");
  
  const updateNow = async (value) => {
    try {
       
      console.log(value, "value change");

      await toast.promise(updateDocument(editId, {status: value}), {
        loading: "Updating order ...",
        success: "order updated successfully!",
        error: "Failed to update order",
      });

    } catch (err) {
      console.log(err)
     }
   }

  if (error) return <div>Error: {error.message}</div>
  if (loading) return <Loading />;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{orderData.name}</h3>
          <Select onValueChange={(value)=>updateNow(value)} defaultValue={orderData.status}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Order Date:</span>{" "}
            {moment(orderData.createdAt).format("MMMM Do YYYY, h:mm a")}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {orderData.address}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {orderData.phone}
          </p>
          <p>
            <span className="font-semibold">Note:</span> {orderData.note}
          </p>
          <p>
            <span className="font-semibold">Country:</span>{" "}
            {orderData.countryName}
          </p>
          <p>
            <span className="font-semibold">Shipping fee:</span>
             {CURRENCY?.sign}{orderData.shippingFee}
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">Cart Items:</h4>
          {orderData?.cartItems?.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b border-dashed">
              <span>{item.name}</span>
              <span>
                {CURRENCY?.sign}
                {item?.price?.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-6 font-bold">
            <span>Total + shipping:</span>
            <span>
              {CURRENCY?.sign}
              {orderData?.cartTotal?.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
