import React from "react";
import ProductPage from "../components/details";

// Simulating an API call to fetch product data
const getProduct = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const product = {
    id: 1,
    name: "Natural HPV Treatment",
    price: 177.81,
    originalPrice: 213.38,
    category: "Immune Support",
    description:
      "Our Natural HPV Treatment is a powerful blend of herbs and nutrients designed to support your body's natural defenses against HPV (Human Papillomavirus). This unique formula combines the strength of traditional herbal remedies with modern nutritional science to provide comprehensive immune support.",
    usage:
      "Take 2 capsules twice daily with meals, or as directed by your healthcare practitioner. For best results, use consistently for at least 3-6 months. Always consult with a healthcare professional before starting any new supplement regimen, especially if you have any pre-existing medical conditions or are taking medications.",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
    ],
  };

  if (parseInt(id) !== product.id) {
    return null;
  }

  return product;
};

// Generating metadata for the page, using the new metadata API
export async function generateMetadata({ params }) {
  const id = params.id;
  const product = await getProduct(id);

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
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

// Server component to display product details, optimized for Next.js 15
export default async function ProductDetails({ params }) {
  const product = await getProduct(params.id);

  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductPage item={product} />;
}
