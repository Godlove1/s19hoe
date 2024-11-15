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
import { Textarea } from "@/components/ui/textarea";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/app/(users)/loading";
import {
  CURRENCY,
  uploadFilesToAppWrite,
  useFirestoreCRUD,
  useFirestoreDoc,
  useFirestoreQuery,
} from "@/lib/firebaseHooks";

export default function ProductEditForm({ editId }) {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "",
    description: "",
    howToUse: "",
    categoryId: "",
    minOrder: 1,
  });

  const { data:categories } = useFirestoreQuery("allCategories");
  const {
    data:productData,
    loading,
    error,
  } = useFirestoreDoc("allProducts", editId);
  const { updateDocument } = useFirestoreCRUD("allProducts");

  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || "",
        price: productData.price?.toString() || "",
        status: productData?.status || "",
        description: productData.description || "",
        howToUse: productData.howToUse || "",
        categoryId: productData?.categoryId || "",
        minOrder: productData.minOrder || 1,
      });
      setImagePreviews(productData.productPics || []);
    }

    console.log(productData, "productData")
  }, [productData]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
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

 
   const handleCategoryChange = (value) => {
     setFormData((prevData) => ({
       ...prevData,
       categoryId: value,
     }));
  };
  
  const handleStatusChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      status: value,
    }));
  };


  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || isNaN(Number(formData.price)))
      newErrors.price = "Valid price is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";
    if (!formData.description?.trim())
      newErrors.description = "Description is required";
    if (!formData.howToUse?.trim())
      newErrors.howToUse = "How to use is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      let productData = {
        ...formData,
        searchName: formData.name.toLowerCase(),
        price: Number(formData.price),
        productPics: imagePreviews,
      };

       if (imageFiles.length > 0) {
         const fileUrls = await uploadFilesToAppWrite(Array.from(imageFiles));
         console.log("Uploaded file URLs:", fileUrls);
         productData.productPics = fileUrls;
       }

      await toast.promise(updateDocument(editId, productData), {
        loading: "Updating product...",
        success: "Product updated successfully!",
        error: "Failed to update product",
      });

      console.log(productData, "productData");
      router.push("/admin/dashboard/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the form when formData is fully populated
if (loading || !formData.status) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
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
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price(in {CURRENCY?.name})</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                onValueChange={handleCategoryChange}
                value={formData.categoryId}
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
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ""} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />     
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ON">Available</SelectItem>
                    <SelectItem value="OFF">Not Available</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {errors?.status && (
                <p className="text-red-500 text-sm mt-1">{errors?.status}</p>
              )}
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="picture">Pictures</Label>
              <Input
                id="picture"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                multiple
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews?.map((preview, index) => (
                  <div key={index} className="w-20 h-20 relative">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover border rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              className="min-h-[100px]"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="howToUse">How to use</Label>
            <Textarea
              id="howToUse"
              name="howToUse"
              value={formData.howToUse}
              onChange={handleInputChange}
              placeholder="Enter usage instructions"
              className="min-h-[100px]"
            />
            {errors.howToUse && (
              <p className="text-red-500 text-sm mt-1">{errors.howToUse}</p>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              type="submit"
              variant="destructive"
              size="lg"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  Saving... <span className="ml-2 animate-spin">⟳</span>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
