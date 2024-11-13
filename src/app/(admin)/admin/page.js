"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignUp() {
  const router = useRouter();

 const allowedEmails = [
   "ething215@gmail.com",
 ]; 

 const signUpWithGoogle = async () => {
   const provider = new GoogleAuthProvider();
   try {
     const result = await signInWithPopup(auth, provider);

     if (result.user) {
       const userEmail = result?.user?.email;
       if (allowedEmails.includes(userEmail)) {
         // Email is allowed, proceed with login
         await updateProfile(result?.user, {
           displayName: result?.user.displayName,
         });
         // Save user data to Firestore or perform other actions
         console.log("User  signed up with Google:", result.user);
         // Redirect to the protected route
          toast.success("redirecting...");
         router.push("/admin/dashboard");
        
       } else {
         // Email is not allowed, log error and prevent login
         toast.error(`Email ${userEmail} is not recognized`);
       }
     }
   } catch (error) {
     toast.error("Error signing up with Google : try again", error);
   }
 };

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white py-8 px-4 sm:rounded-lg sm:px-10 w-full max-w-md">
        <div className="mt-6">
          <div className="flex justify-center text-sm">
            <span className="px-2 bg-white  text-gray-500">login with</span>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={signUpWithGoogle}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>
          <Link href={'/'} className="flex justify-center text-sm mt-8">
            <span className="px-2 bg-white  text-gray-500 flex items-center underline
            "> <ArrowLeft className="mx-3" /> back to website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}