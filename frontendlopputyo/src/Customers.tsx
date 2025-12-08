import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  streetaddress: string;
  city: string;
  postcode: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetch("https://traineeapp.azurewebsites.net/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.content));
  }, []);

  const columns: GridColDef[] = [
    { field: "firstname", headerName: "First Name", flex: 1 },
    { field: "lastname", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "streetaddress", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "postcode", headerName: "Postcode", flex: 1 },
  ];

  return (
    <Box sx={{ height: "80vh", width: "100%", p: 3 }}>
      <h1 style={{ fontFamily: "sans-serif" }}>Customers</h1>
      <DataGrid
        rows={customers}
        columns={columns}
        getRowId={(row) => row.id}
        disableColumnMenu={false}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
      />
    </Box>
  );
}
