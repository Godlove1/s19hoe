"use client";

import { Button } from "@/components/ui/button";
import { allCatsRef, allFoodsRef, deleteDocument, foodRef } from "@/lib/api";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { doc, getDocs, query, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import Image from "next/image";
import "../../../../loading.css";
import GridTable from "../adminComponents/GridTable";
import SkeletonTable from "../adminComponents/tableLoading";
import ActionButtonComponent from "../adminComponents/ActionButtonComponent";

export default function AllFood() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCatMap] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "",
    description: "",
    categoryId: "",
    minOrder: 1,
  });

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const [products, catsQuery] = await Promise.all([
          getDocs(query(allFoodsRef)),
          getDocs(query(allCatsRef)),
        ]);

        setData(products.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

        const fetchedCategories = catsQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategories(fetchedCategories);

        // CATEGORY MAP
        const categoryMap = {};
        fetchedCategories.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });

        setCatMap(categoryMap);

        setLoading(false);
      } catch (err) {
        console.log(err, ": error");
        toast.error("Something went wrong");
      }
    };

    getData();
  }, []);

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
      setLoading(true);

      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storage = getStorage();
          const storageRef = ref(storage, `productImages/${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );

      const object = {
        id: doc(allFoodsRef).id,
        ...formData,
        minOrder: Number(formData.minOrder),
        searchName: formData.name.toLowerCase(),
        price: Number(formData.price),
        productPics: imageUrls,
        dateCreated: new Date().toISOString(),
      };

      console.log("Form submitted:", object);

      await toast.promise(setDoc(foodRef(object.id), object), {
        loading: "Saving...",
        success: <b>Saved!</b>,
        error: <b>Could not Save.</b>,
      });

      setIsOpen(false);
      setLoading(false);
      refreshPage();
      setFormData({
        name: "",
        price: "",
        status: "",
        description: "",
        productPics: "",
        categoryId: "",
        minOrder: 1 || "",
      });
      setImagePreviews(null);
      setImageFiles(null);
    } catch (err) {
      console.log(err, ": error");
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  // console.log(data, "data")

  async function executeDelete(id) {
    try {
      await toast.promise(deleteDocument(foodRef(id)), {
        loading: "Deleting...",
        success: <b>Deleted!</b>,
        error: <b>Could not delete.</b>,
      });
      refreshPage();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

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
          {/* <Image
            src={params.data.foodPic || "/logo.jpg"}
            width={10}
            height={10}
            priority
            alt="logo"
            className="w-8 h-8 mr-3 rounded-full shadow"
          /> */}
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
          <DialogContent className="sm:max-w-[900px] rounded-lg  p-0 lg:p-6">
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
                  {imagePreviews.map((preview, index) => (
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

              <div className="w-full my-4 flex justify-center items-center">
                {loading ? (
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-1/2  mt-6"
                  >
                    <span className="loading loading-ring loading-lg text-white"></span>
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="destructive"
                    size="lg"
                    className="w-1/2  mt-6"
                  >
                    Add product
                  </Button>
                )}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="wrapper my-3 ">
        {loading ? (
          <SkeletonTable />
        ) : (
          <div className={"ag-theme-quartz"} style={{ height: 500 }}>
            <GridTable columnDefs={columnDefs} data={data} />
          </div>
        )}
      </div>
    </>
  );
}
