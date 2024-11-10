"use client";

import { Button } from "@/components/ui/button";
import { allCatsRef, foodRef, getDocument, updateDocument } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocs, query } from "firebase/firestore";
import Image from "next/image";
import Loading from "@/app/(users)/loading";

export default function Compo({ editId }) {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [EditLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "",
    description: "",
    categoryId: "",
    minOrder: 1,
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || isNaN(formData.price))
      newErrors.price = "Valid price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setEditLoading(true);

      let imageUrls = null;
      if (imageFiles) {
        imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const storage = getStorage();
            const storageRef = ref(storage, `productImages/${file.name}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
      }

      const updatedFields = {
        ...formData,
        minOrder: Number(formData.minOrder),
        searchName: formData.name.toLowerCase(),
        price: Number(formData.price),
        productPics: imageUrls || formData?.imageUrls,
        dateUpdated: new Date().toISOString(),
      };

      await toast.promise(updateDocument(foodRef(editId), updatedFields), {
        loading: "Updating...",
        success: <b>Updated!</b>,
        error: <b>Could not Update.</b>,
      });

      router.push("/admin/dashboard/products");

      setEditLoading(false);

      setFormData({
        name: "",
        price: "",
        status: "",
        description: "",
        categoryId: "",
        minOrder: 1,
      });
      setImagePreviews(null);
      setImageFiles(null);
    } catch (err) {
      console.log(err, ": error");
      setEditLoading(false);
    }
  };

  useEffect(() => {
    const getDataFill = async () => {
      setLoading(true);
      try {
        const [catsQuery] = await Promise.all([getDocs(query(allCatsRef))]);

        setCategories(
          catsQuery.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );

        const getData = async () => {
          //  setLoading(true);
          try {
            const res = await getDocument(foodRef(editId));
            setFormData({
              name: res?.name || "",
              price: res?.price || "",
              status: res?.status || "",
              description: res?.description || "",
              categoryId: res?.categoryId || "",
              minOrder: res?.minOrder || 1,
            });

            setImagePreviews(res?.imageUrls || null);
            //  setLoading(false);
            // console.log(res, ": response");
          } catch (err) {
            console.log(err, ": error");
            toast.error("Something went wrong");
          }
        };

        getData();

        setLoading(false);
      } catch (err) {
        console.log(err, ": error");
        toast.error("Something went wrong");
      }
    };

    getDataFill();
  }, []);

  return (
    <>
      {loading ? (
        <>
          <Loading />{" "}
        </>
      ) : (
        <Card className="w-full max-w-7xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500 text-xl">Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter food name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange(value, "categoryId")
                    }
                    value={formData.categoryId}
                    required
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>--category--</SelectLabel>

                        {categories?.map((res, i) => {
                          return (
                            <SelectItem key={i} value={res?.id}>
                              {res?.name}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange(value, "status")
                    }
                    value={formData.status}
                    required
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="ON">Live</SelectItem>
                        <SelectItem value="OFF">Disable</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center">
                  <div className="f">
                    <Label htmlFor="picture">Pictures</Label>
                    <Input
                      id="picture"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                    />
                  </div>
                  {imagePreviews?.map((preview, index) => (
                    <div
                      key={index}
                      className="mt-2 w-20 h-20 overflow-hidden  ml-4 "
                    >
                      <img
                        src={preview}
                        alt={`preview ${index + 1}`}
                        className="w-full h-full border rounded-md border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter food description"
                  className="min-h-[50px]"
                />
              </div>

              <div>
                <Label htmlFor="description">How to use</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter food description"
                  className="min-h-[50px]"
                />
              </div>

              <div className="w-full flex justify-center items-center my-6">
                {EditLoading ? (
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
          </CardContent>
        </Card>
      )}
    </>
  );
}
