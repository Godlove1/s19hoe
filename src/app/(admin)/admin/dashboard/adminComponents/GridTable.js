"use client"
import React from 'react'
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useMemo } from "react";

export default function GridTable({columnDefs, data}) {

     const defaultColDef = useMemo(() => {
       return {
         filter: "agTextColumnFilter",
         floatingFilter: true,
       };
     }, []);

    
  return (
    <>
      <style jsx global>{`
        .ag-paging-panel {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .ag-paging-row-summary-panel {
          display: none;
        }
      `}</style>
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={20}
        paginationPageSizeSelector={[20, 35, 50]}
      />
    </>
  );
}
