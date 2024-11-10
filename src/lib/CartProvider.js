"use client"

import { CartProvider } from "react-use-cart";

export function CartProviderContext({ children }) {
  return <CartProvider>{children}</CartProvider>;
}