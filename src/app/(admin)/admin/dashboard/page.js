"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Notebook } from "lucide-react";
import { CatalogueIcon, GroupItemsIcon } from "hugeicons-react";
import { useMultiCollectionStats } from "@/lib/firebaseHooks";

export default function Dashboard() {

  const { stats, loading, error } = useMultiCollectionStats([
    {
      name: "totalProducts",
      collection: "allProducts",
    },
    {
      name: "totalCategories",
      collection: "allCategories",
    },
    {
      name: "totalOrders",
      collection: "allOrders",
    },
    {
      name: "totalCountries",
      collection: "allCountries",
    },
  ]);

    if (error) return <div>Error: {error}</div>;

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
                  <>{stats?.totalProducts}</>
                )}
              </div>
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
                  <>{stats?.totalCategories}</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
             Total Orders
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
                  <>{stats?.totalOrders}</>
                )}
              </div>
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
                  <>{stats?.totalCountries}</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
