"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(users)/loading";
import { useFirestoreCRUD, useFirestoreDoc } from "@/lib/firebaseHooks";

export default function Compo({ editId }) {
  const {
    data: countryData,
    loading,
    error,
  } = useFirestoreDoc("allCountries", editId);
  const { updateDocument } = useFirestoreCRUD("allCountries");
  const router = useRouter();
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    countryName: "",
    price: "",
  });

  // Update formData when countryData changes
  useEffect(() => {
    if (countryData) {
      setFormData({
        countryName: countryData.countryName || "",
        price: countryData.price || "",
      });
    }
  }, [countryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple check to ensure all fields are filled
    if (!formData.countryName || !formData.price) {
      toast.error("all fields are required");
      return;
    }

    try {
      setEditLoading(true);

      // console.log(formData, "status");

      await toast.promise(
        updateDocument(editId, { ...formData, price: Number(formData?.price) }),
        {
          loading: "updating...",
          success: <b>Saved!</b>,
          error: <b>Could not Save.</b>,
        }
      );

      router.push("/admin/dashboard/shipping");

      setEditLoading(false);
    } catch (err) {
      console.log(err, ": error");
      setEditLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <>
          <Loading />{" "}
        </>
      ) : (
        <div className="wrapper w-full flex justify-center items-center p-6">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-white p-4  rounded-md shadow"
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Country Name
                </Label>
                <Input
                  id="countryName"
                  placeholder="cameroon"
                  className="col-span-3"
                  name="countryName"
                  value={formData.countryName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Price
                </Label>
                <Input
                  id="price"
                  placeholder="cameroon"
                  className="col-span-3"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="w-full flex justify-center items-center my-6">
              {editLoading ? (
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full md:w-auto mt-6"
                >
                  Loading{" "}
                  <span className="loading loading-spinner mx-2 text-white loading-sm"></span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  className="w-full md:w-auto mt-6"
                >
                  Save
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
