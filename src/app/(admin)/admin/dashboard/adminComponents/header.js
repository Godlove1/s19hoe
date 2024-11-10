"use client"
import React from 'react'
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu
} from "lucide-react";
import { useAuth } from '@/lib/Authcontext';
import { Logout01Icon, UserAccountIcon } from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function Header({ toggleSidebar }) {

  const { user, logOut } = useAuth();
  const router = useRouter()

    if (user?.isAnonymous) {
      router.push('/admin')
    }

 console.log(user, "userData")

  return (
    <>
      <header className="flex h-16 items-center  justify-between border-b bg-white px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="ml-auto flex items-center space-x-4 w-full">
          <div className="w-full flex items-center justify-end gap-2">
            {user?.isAnonymous ? (
              <Link title="go to login" href={"/login"}>
                <UserAccountIcon
                  className="ml-4 text-gray-600  hover:text-green-600 transition-all ease-linear rounded-md p-1 cursor-pointer"
                  size={34}
                />
              </Link>
            ) : (
              <div className="flex items-center justify-end  w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Logout"
                  className="font-bold capitalize text-xl mx-4"
                >
                  {user?.displayName}
                </Button>

                <Button
                  onClick={logOut}
                  variant="destructive"
                  size="icon"
                  title="Logout"
                  className="mx-8 w-[200px]"
                >
                Log out  <Logout01Icon size={32} /> 
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
