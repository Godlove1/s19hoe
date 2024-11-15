"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/(users)/loading";
import { useFirestoreCRUD, useFirestoreDoc } from "@/lib/firebaseHooks";

export default function Compo({ editId }) {
  const {
    data: categoryData,
    loading,
    error,
  } = useFirestoreDoc("allCategories", editId);
  const { updateDocument } = useFirestoreCRUD("allCategories");
  const router = useRouter();
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    status: "",
  });

  // Update formData when categoryData changes
  useEffect(() => {
    if (categoryData) {
      setFormData({
        name: categoryData.name || "",
        status: categoryData.status || "",
      });
    }
  }, [categoryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      status: value,
    }));
  };

  // console.log(categoryData, "to be edited data")

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple check to ensure all fields are filled
    if (!formData.name || !formData.status) {
      toast.error("all fields are required");
      return;
    }

    try {
      setEditLoading(true);

      // console.log(formData, "status");

      await toast.promise(updateDocument(editId, formData), {
        loading: "updating...",
        success: <b>Saved!</b>,
        error: <b>Could not Save.</b>,
      });

      router.push("/admin/dashboard/categories");

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
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="immune support"
                  className="col-span-3"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={handleSelectChange}
                  defaultValue={formData?.status}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder={formData?.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="ON">turn-on</SelectItem>
                      <SelectItem value="OFF">turn-off</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                  Update
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
