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

export default function AllOrders() {
 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryMap, setCatMap] = useState({});
 

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
