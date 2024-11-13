"use client";

import "../../../../loading.css";
import GridTable from "../adminComponents/GridTable";
import SkeletonTable from "../adminComponents/tableLoading";
import ActionButtonComponent from "../adminComponents/ActionButtonComponent";
import {
  CURRENCY,
  useFirestoreQuery,
} from "@/lib/firebaseHooks";
import { orderBy } from "firebase/firestore";

export default function AllOrders() {
  
    const {
      data: orders,
      loading,
      error,
    } = useFirestoreQuery("allOrders");



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
      headerName: "Name of client",
      cellRenderer: (params) => (
        <div className="flex items-center">
          <p>{params.data.name}</p>
        </div>
      ),
      autoSize: true,
      minWidth: 250,
    },
    {
      field: "total",
      autoSize: true,
      minWidth: 70,
      headerName: "Total Price",
      valueGetter: (params) => params.data.totalPrice,
      valueFormatter: (params) => CURRENCY?.sign + params.value.toLocaleString(),
    },
    {
      field: "itemsCount",
      headerName: "# of Items",
      minWidth: 70,
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
        <ActionButtonComponent data={props.data} />
      ),
      flex: 2,
      autoSize: true,
      minWidth: 100,
    },
  ];

    if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="wrapper my-3">
        {loading && !orders.length ? (
          <SkeletonTable />
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            Error loading orders: {error.message}
          </div>
        ) : (
          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <GridTable columnDefs={columnDefs} data={orders} />
          </div>
        )}
      </div>
    </>
  );
}
