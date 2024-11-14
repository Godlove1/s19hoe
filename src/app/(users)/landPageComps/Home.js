"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import {
  InstagramIcon,
  SnapchatIcon,
  TelegramIcon,
  WhatsappIcon,
} from "hugeicons-react";
import ProductCard from "@/components/custom/ProductCard";
import Categories from "@/components/custom/categories";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { pageSize } from "@/lib/firebaseHooks";
import Loading from "../loading";

const useFirestoreDataLoader = (collectionName, categoryId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setData([]); // Clear existing data
    try {
      const baseQuery = query(
        collection(db, collectionName),
        ...(categoryId !== "all"
          ? [where("categoryId", "==", categoryId)]
          : []),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
      const snapshot = await getDocs(baseQuery);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
        setData(docs);

        console.log(docs, "products");
        
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [collectionName, categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const moreQuery = query(
        collection(db, collectionName),
        ...(categoryId !== "all"
          ? [where("categoryId", "==", categoryId)]
          : []),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
      const moreSnapshot = await getDocs(moreQuery);
      const newDocs = moreSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData((prev) => [...prev, ...newDocs]);
      setLastDoc(moreSnapshot.docs[moreSnapshot.docs.length - 1]);
      setHasMore(moreSnapshot.docs.length === pageSize);
    } catch (err) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return { data, loading, loadingMore, error, hasMore, loadMore };
};

export default function Homepage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    } = useFirestoreDataLoader("allProducts", selectedCategory);
    

   

  return (
    <>
      {/* Hero Section */}
      <section className="bg-green-50 pt-16 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            NATURAL HEALING
            <br />
            <span className="text-green-600 font-extrabold">SOLUTIONS</span>
          </h1>
          <p className="text-gray-600 text-sm lg:text-base my-4 max-w-2xl mx-auto">
            Discover nature's most powerful remedies for common health
            conditions. Our carefully selected natural solutions support your
            journey to wellness.
          </p>
          <p className="text-gray-600 text-sm lg:text-base my-8 max-w-2xl mx-auto">
            I am a Naturopath meaning i use natural remedies to help people
            prevent and heal from infections and diseases without the use of
            pharmacy drugs or surgeries.
          </p>

          <p className="text-gray-600 text-sm lg:text-base mb-4 max-w-2xl mx-auto">
            At S19herbs, we treat all types of{" "}
            <strong className="underline">
              Ailments including Fibroid, Hepatitis, Kidney Infections,
              Diabetes, Herpes & HIV
            </strong>
            . Shocking?!! <span className="text-green-600 font-bold">Yes</span>,
            we provide the cure for <strong>Herpes, Hiv</strong> and even
            certain types of <strong>Cancers</strong>
          </p>

          <Button
            variant="outline"
            className="bg-green-600 mt-6 text-white text-xs shadow-lg"
          >
            Mantra - Health Over Everything
          </Button>

          <div className="socials flex justify-center items-center gap-x-6 mt-8">
            <a
              href="http://"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors ease-linear"
            >
              <SnapchatIcon />
            </a>
            <a
              href="http://wa.me/+23781000"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors ease-linear"
            >
              <WhatsappIcon />
            </a>
            <a
              href="http://"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors ease-linear"
            >
              <TelegramIcon />
            </a>
            <a
              href="http://"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-600 transition-colors ease-linear"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-center mt-6">
            Our <span className="text-green-600">Products</span>{" "}
          </h2>

          <Categories
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>
      </section>

      {/* Product Grid */}
      <section className="mt-8 lg:my-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-8 px-4 lg:px-3">
                {products?.map((product, i) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {!hasMore && products.length === 0 && (
                <div className="w-full flex justify-center items-center">
                  <div className="w-auto border-2 border-gray-300 border-spacing-4 border-dashed rounded-lg p-8 text-center">
                    <div className="text-center italic text-gray-400 animate-pulse">
                      no products under here yet
                    </div>
                  </div>
                </div>
              )}

              {/* Load more section */}
              <div className="mt-8 text-center">
                {loadingMore && (
                  <div className="flex justify-center">
                    <Loading />
                  </div>
                )}

                {hasMore && !loadingMore && (
                  <Button
                    onClick={loadMore}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
                  >
                    Load More
                    <MoreHorizontalIcon className="ml-2" />
                  </Button>
                )}

                {!hasMore && products.length > 0 && (
                  <div className="text-center italic text-gray-400 animate-pulse">
                    That's all!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
