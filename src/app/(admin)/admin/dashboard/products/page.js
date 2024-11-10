"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { DialogTitle } from "@radix-ui/react-dialog";
import "../../../../loading.css";
import GridTable from "../adminComponents/GridTable";
import SkeletonTable from "../adminComponents/tableLoading";
import ActionButtonComponent from "../adminComponents/ActionButtonComponent";
import {
  useFirestoreCRUD,
  useFirestoreQuery,
  useMultiJoinFirestoreQuery,
} from "@/lib/firebaseHooks";
import { orderBy } from "firebase/firestore";

export default function AllFood() {
  const {
    documents: data,
    loading,
    error,
  } = useMultiJoinFirestoreQuery({
    collection: "allProducts",
    constraints: [orderBy("createdAt", "desc")], 
    joins: [
      {
        collection: "allCategories",
        foreignKey: "categoryId",
        as: "category",
      },
    ],
  });

  const { data: categories, loading: categoriesLoading } =
    useFirestoreQuery("allCategories");
  const { addDocument, deleteDocument } = useFirestoreCRUD("allProducts");

  const [ELoad, setELoad] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const initialFormState = {
    name: "",
    price: "",
    status: "",
    description: "",
    howToUse: "",
    categoryId: "",
    minOrder: 1,
  };

  const [formData, setFormData] = useState(initialFormState);

  const categoryMap =
    categories?.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {}) || {};

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.status) newErrors.status = "Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

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

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setImageFiles([]);
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImagePreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setELoad(true);
      let productData = {
        ...formData,
        searchName: formData.name.toLowerCase(),
        price: Number(formData.price),
        createdAt: new Date().toISOString(),
        productPics: [], // Default empty array for images
      };

      // Only process images if files were selected
      if (imageFiles.length > 0) {
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            toast.loading(`Uploading ${file.name}`);
            const storage = getStorage();
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `productImages/${uniqueFileName}`);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
          })
        );
        productData.productPics = imageUrls;
      }

      await toast.promise(addDocument(productData), {
        loading: "Saving product...",
        success: "Product saved successfully!",
        error: "Failed to save product",
      });

      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product");
    } finally {
      setELoad(false);
    }
  };

  const executeDelete = async (id) => {
    try {
      await toast.promise(deleteDocument(id), {
        loading: "Deleting product...",
        success: "Product deleted successfully!",
        error: "Failed to delete product",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const columnDefs = [
    {
      field: "ID",
      valueGetter: (params) => params.node.rowIndex + 1,
      filter: false,
      autoSize: true,
      maxWidth: 50,
    },
    {
      field: "name",
      headerName: "Name",
      cellRenderer: (params) => (
        <div className="flex items-center">
          {params.data.productPics?.[0] && (
            <img
              src={params.data.productPics[0]}
              alt={params.data.name}
              className="w-8 h-8 mr-3 rounded-full shadow object-cover"
            />
          )}
          <p>{params.data.name}</p>
        </div>
      ),
      autoSize: true,
      minWidth: 250,
    },
    {
      field: "price",
      autoSize: true,
      minWidth: 70,
      headerName: "Price",
      valueGetter: (params) => params.data.price,
      valueFormatter: (params) => "XAF " + params.value.toLocaleString(),
    },
    {
      field: "categoryId",
      headerName: "Category",
      valueGetter: (params) =>
        categoryMap[params.data.categoryId] || "Unknown Category",
      autoSize: true,
      minWidth: 130,
    },
    {
      field: "status",
      flex: 1,
      cellClassRules: {
        "rag-red": (params) => params.data.status === "OFF",
      },
      autoSize: true,
      minWidth: 80,
    },
    {
      field: "Action",
      filter: false,
      cellRenderer: (props) => (
        <ActionButtonComponent data={props.data} onDelete={executeDelete} />
      ),
      flex: 2,
      autoSize: true,
      minWidth: 100,
    },
  ];

  return (
    <>
      <div className="flex w-full justify-end items-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex items-center justify-center"
            >
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] rounded-lg p-0 lg:p-6">
            <DialogHeader>
              <DialogTitle className="text-red-500 font-bold text-xl">
                New Product
              </DialogTitle>
            </DialogHeader>
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
                    required
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
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    required
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
                        <SelectItem value="ON">Available</SelectItem>
                        <SelectItem value="OFF">Not Available</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="picture">Pictures</Label>
                  <Input
                    id="picture"
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="w-24 h-24 relative">
                        <img
                          src={preview}
                          alt={`preview ${index + 1}`}
                          className="w-full h-full object-cover border rounded-md border-gray-300"
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="howToUse">How to use</Label>
                <Textarea
                  id="howToUse"
                  name="howToUse"
                  value={formData.howToUse}
                  onChange={handleInputChange}
                  placeholder="Enter usage instructions..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="w-full flex justify-center items-center">
                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  className="w-1/2 mt-6"
                  disabled={ELoad}
                >
                  {ELoad ? (
                    <>
                      <span className="loading loading-ring loading-lg text-white"></span>{" "}
                      saving
                    </>
                  ) : (
                    "Add product"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="wrapper my-3">
        {loading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            Error loading products: {error.message}
          </div>
        ) : (
          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <GridTable columnDefs={columnDefs} data={data} />
          </div>
        )}
      </div>
    </>
  );
}
