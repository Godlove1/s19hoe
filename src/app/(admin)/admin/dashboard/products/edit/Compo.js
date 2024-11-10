"use client";

import { Button } from "@/components/ui/button";
import { updateDocument } from "@/lib/api";
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
import { useFirestoreCRUD, useFirestoreDoc, useFirestoreQuery } from "@/lib/firebaseHooks";

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

  const { data: categories } = useFirestoreQuery("allCategories");

  const {
    data: productData,
    loading,
    error,
  } = useFirestoreDoc("allProducts", editId);
    const { updateDocument } = useFirestoreCRUD("allProducts");

  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData?.name || "",
        price: productData?.price || "",
        status: productData?.status || "",
        description: productData?.description || "",
        howToUse: productData?.howToUse || "",
        categoryId: productData?.categoryId || "",
        minOrder: productData?.minOrder || 1,
      });
      setImagePreviews(productData?.productPics || []);
    }
  }, [productData]);

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
        productPics: imagePreviews, // Keep existing images if no new ones
      };

      if (imageFiles.length > 0) {
        const storage = getStorage();
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `productImages/${uniqueFileName}`);
            await toast.promise(uploadBytes(storageRef, file), {
              loading: `Uploading ${file.name}`,
              success: `${file.name} uploaded`,
              error: `Failed to upload ${file.name}`,
            });
            return await getDownloadURL(storageRef);
          })
        );
        productData.productPics = imageUrls;
      }

      await toast.promise(updateDocument(editId, productData), {
        loading: "Updating product...",
        success: "Product updated successfully!",
        error: "Failed to update product",
      });

console.log(productData, "productData")
      router.push("/admin/dashboard/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <Loading />;
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
              <Label htmlFor="price">Price</Label>
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
                onValueChange={(value) =>
                  handleSelectChange(value, "categoryId")
                }
                value={formData.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                onValueChange={(value) => handleSelectChange(value, "status")}
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ON">Active</SelectItem>
                    <SelectItem value="OFF">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
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
