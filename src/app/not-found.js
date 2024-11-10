import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PizzaIcon, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-green-600">
            Oops! Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
         
          <p className="text-gray-600">
            The page you&lsquo;re looking for might have been moved, deleted maybe it was just a figment of your hungry imagination.
          </p>
        </CardContent> 
        <CardFooter className="flex justify-center items-center my-6 ">
          <Link
            href={"/"}
            className="max-w-sm flex items-center p-4 text-white btn btn-lg bg-green-500 hover:bg-green-600"
          >
            <HomeIcon className="mr-2" size={16} />
           Return home
          </Link>
         
        </CardFooter>
      </Card>
    </div>
  );
};

