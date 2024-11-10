"use client";

import { allCatsRef, deleteDocument, singleCatRef } from "@/lib/api";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { doc, getDocs, query, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import "../../../../loading.css";
import { Button } from "@/components/ui/button";
import GridTable from "../adminComponents/GridTable";
import ActionButtonComponent from "../adminComponents/ActionButtonComponent";
import SkeletonTable from "../adminComponents/tableLoading";

export default function Shipping() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    countryName: "",
    price: "",
  });

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
    if (!formData.name || !formData.price) {
      toast.error("all fields are required");
      return;
    }

    try {
      setLoading(true);

      const Id = doc(allCatsRef).id;
      const object = {
        id: Id,
        ...formData,
        dateCreated: new Date().toISOString(),
      };

      console.log("Form submitted:", object);

      await toast.promise(setDoc(singleCatRef(object.id), object), {
        loading: "Saving...",
        success: <b>Saved!</b>,
        error: <b>Could not Save.</b>,
      });

      setIsOpen(false);
      setLoading(false);
      setFormData({
        countryName: "",
        price: "",
      });
    } catch (err) {
      console.log(err, ": error");
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const initQuery = await getDocs(query(allCatsRef));
        const res = initQuery.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setData(res);
        setLoading(false);

        console.log(res, ": response");
      } catch (err) {
        console.log(err, ": error");
        toast.error("Something went wrong");
      }
    };

    getData();
  }, []);

  async function executeDelete(id) {
    try {
      await toast.promise(deleteDocument(singleCatRef(id)), {
        loading: "Deleting...",
        success: <b>Deleted!</b>,
        error: <b>Could not delete.</b>,
      });
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
      field: "countryName",
      headerName: "Country",
      cellRenderer: (params) => (
        <div className="flex items-center">
          <p>{params.data.countryName}</p>
        </div>
      ),
      autoSize: true,
      minWidth: 200,
    },
    {
      field: "price",
      flex: 1,
      autoSize: true,
      minWidth: 100,
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
              Add Shipping <PlusCircledIcon className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] bg-white">
            <form onSubmit={handleSubmit} className="w-full">
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
                <DialogDescription>
                  Click save when you&lsquo;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Country Name
                  </Label>
                  <Input
                    id="countryName"
                    placeholder="immune support"
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
                    placeholder="immune support"
                    className="col-span-3"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="w-full flex justify-center items-center my-6">
                  {loading ? (
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full md:w-auto mt-6"
                    >
                      Loading{" "}
                      <span className="loading loading-ring loading-lg text-white"></span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="destructive"
                      size="lg"
                      className="w-full md:w-auto mt-6"
                    >
                      Add Category
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="wrapper my-3 ">
        {loading ? (
          <SkeletonTable />
        ) : (
          <div className={"ag-theme-quartz"} style={{ height: 400 }}>
            <GridTable columnDefs={columnDefs} data={data} />
          </div>
        )}
      </div>
    </>
  );
}
