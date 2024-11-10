"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Notebook } from "lucide-react";
import { CatalogueIcon, GroupItemsIcon } from "hugeicons-react";
import { allCatsRef, allCustomRequestsRef, allOrdersRef } from "@/lib/api";
import { useState, useEffect } from "react";
import {
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState({
    totalProducts: 0,
    totalCategories: 0,
    shipping: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [totalProducts, totalCategories, shipping] = await Promise.all([
          getCountFromServer(allOrdersRef),
          getCountFromServer(allCustomRequestsRef),
          getCountFromServer(allCatsRef),
        ]);

        setCounts({
          totalProducts: totalProducts.data().count,
          totalCategories: totalCategories.data().count,
          shipping: shipping.data().count,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching counts: ", error);
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // console.log(counts, "counts")

  return (
    <>
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Overview</h1>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <GroupItemsIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <>
                    <p className="skeleton bg-gray-200 h-6 w-6"></p>
                  </>
                ) : (
                  <>{counts?.totalProducts}</>
                )}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Categories
              </CardTitle>
              <Notebook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <>
                    <p className="skeleton bg-gray-200 h-6 w-6"></p>
                  </>
                ) : (
                  <>{counts?.totalCategories}</>
                )}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Shipping Countries
              </CardTitle>
              <CatalogueIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <>
                    <p className="skeleton bg-gray-200 h-6 w-6"></p>
                  </>
                ) : (
                  <>{counts?.shipping}</>
                )}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
