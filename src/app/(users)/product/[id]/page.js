// app/products/[id]/page.js
import { headers } from "next/headers";
import { doc, getDoc } from "firebase/firestore";
import ProductPage from "../components/details";
import { db } from "@/lib/firebase";

// Server-side data fetching function
async function getProduct(id) {
  try {
    const productRef = doc(db, "allProducts", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    const product = {
      id: productSnap.id,
      ...productSnap.data(),
    };


    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Metadata generation
export async function generateMetadata({ params }) {
  const product = await getProduct(params?.id);


  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | s19HOE`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images?.[0]
        ? [
            {
              url: product.images[0],
              width: 800,
              height: 600,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

// Server Component
export default async function ProductDetails({ params }) {
  const product = await getProduct(params.id);

  
  console.log(product, "product");
  
  console.log(params?.id, "id");

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
      </div>
    );
  }

  // Assuming ProductPage is a client component
  return <ProductPage item={product} />;
}
