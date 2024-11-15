"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "./firebase";
import toast from "react-hot-toast";



const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.uid : "No user");
      if (user) {
        setUser(user);
        console.log("user is available")
      } else {
        // Only sign in anonymously if there's no user at all
        signInAnonymously(auth).catch((error) => {
          console.error("Error signing in anonymously:", error);
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success("Signed in with Google successfully!");
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success("You're Signed out");
      // Automatically sign in anonymously after logout
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const isAnonymous = user ? user.isAnonymous : false;

  return (
    <AuthContext.Provider
      value={{ user, isAnonymous, signInWithGoogle, logOut }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
