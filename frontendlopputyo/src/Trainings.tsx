import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

interface Customer {
  firstname: string;
  lastname: string;
}

interface Training {
  id: number;
  date: string;
  activity: string;
  duration: number;
  customer: Customer;
}

export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    fetch("https://traineeapp.azurewebsites.net/api/trainings")
      .then((res) => res.json())
      .then((data) => {
        const trainingsWithCustomer: Training[] = data.content.map(
          (t: any) => ({
            id: t.id,
            date: t.date,
            activity: t.activity,
            duration: t.duration,
            customer: {
              firstname: t.customer.firstname,
              lastname: t.customer.lastname,
            },
          })
        );
        setTrainings(trainingsWithCustomer);
      });
  }, []);

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      // Käytetään any-tyyppiä params:ille, jotta ei tule never-virhettä
      valueFormatter: (params: any) =>
        dayjs(params.value).format("DD.MM.YYYY HH:mm"),
    },
    { field: "activity", headerName: "Activity", flex: 1 },
    { field: "duration", headerName: "Duration (min)", flex: 1 },
    {
      field: "customer",
      headerName: "Customer",
      flex: 1,
      // valueGetter palauttaa asiakkaan nimen merkkijonona(etunimi sukunimi)
      valueGetter: (params: any) =>
        `${params.row.customer.firstname} ${params.row.customer.lastname}`,
    },
  ];

  return (
    <Box sx={{ height: "80vh", width: "100%", p: 3 }}>
      <h1 style={{ fontFamily: "sans-serif" }}>Trainings</h1>
      <DataGrid
        rows={trainings}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </Box>
  );
}
