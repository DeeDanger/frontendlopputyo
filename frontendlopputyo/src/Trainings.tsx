import { useEffect, useState } from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// tyypittelyt

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
}

interface Training {
  id?: string | number;
  date: string;
  duration: number;
  activity: string;
  customer?: Customer | null;
  _links?: any;
}

interface TrainingRow extends Training {
  id: string | number;
  customerName: string;
}

interface TrainingForm {
  date: Dayjs | null;
  activity: string;
  duration: number;
  customerId: number;
}

export default function Trainings() {
  const [trainings, setTrainings] = useState<TrainingRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTraining, setNewTraining] = useState<TrainingForm>({
    date: dayjs(),
    activity: "",
    duration: 0,
    customerId: 0,
  });

  // Lataa asiakkaat
  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers"
    )
      .then((res) => res.json())
      .then((data) => setCustomers(data._embedded.customers));
  }, []);

  // Lataa harjoitukset ja esikäsittele customerName
  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/gettrainings"
    )
      .then((res) => res.json())
      .then((data: Training[]) => {
        const cleaned: TrainingRow[] = data.map((t) => {
          const customer = t.customer ?? null;
          return {
            ...t,
            id: t.id ?? t._links?.self?.href ?? Math.random().toString(),
            customer,
            customerName: customer
              ? `${customer.firstname ?? ""} ${customer.lastname ?? ""}`.trim()
              : "N/A",
          };
        });
        setTrainings(cleaned);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lisää harjoitus
  const handleAddTraining = () => {
    if (newTraining.customerId === 0) {
      alert("Please select a customer");
      return;
    }

    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newTraining.date?.toISOString(),
          activity: newTraining.activity,
          duration: newTraining.duration,
          customer: { id: newTraining.customerId },
        }),
      }
    )
      .then((res) => res.json())
      .then((created) => {
        const customerObj =
          customers.find((c) => c.id === newTraining.customerId) || null;
        const newRow: TrainingRow = {
          ...created,
          id:
            created.id ??
            created._links?.self?.href ??
            Math.random().toString(),
          customer: customerObj,
          customerName: customerObj
            ? `${customerObj.firstname} ${customerObj.lastname}`.trim()
            : "N/A",
        };
        setTrainings((prev) => [...prev, newRow]);
        setOpenDialog(false);

        setNewTraining({
          date: dayjs(),
          activity: "",
          duration: 0,
          customerId: 0,
        });
      });
  };

  // Poista harjoitus
  const handleDeleteTraining = (id: string | number) => {
    if (!confirm("Are you sure you want to delete this training?")) return;

    fetch(
      `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings/${id}`,
      {
        method: "DELETE",
      }
    ).then(() => setTrainings((prev) => prev.filter((t) => t.id !== id)));
  };

  // Sarakkeet DataGridille
  const columns: GridColDef<TrainingRow>[] = [
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      valueFormatter: ({ value }) =>
        value ? dayjs(value as string).format("DD.MM.YYYY HH:mm") : "N/A",
    },
    { field: "activity", headerName: "Activity", flex: 1 },
    {
      field: "duration",
      headerName: "Duration (min)",
      flex: 1,
      type: "number",
    },
    { field: "customerName", headerName: "Customer", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TrainingRow>) => (
        <IconButton
          onClick={() => handleDeleteTraining(params.row.id)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: "80vh", width: "100%", p: 3 }}>
      <h1 style={{ fontFamily: "sans-serif" }}>Trainings</h1>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setOpenDialog(true)}
      >
        Add Training
      </Button>

      {loading ? (
        <p>Loading trainings...</p>
      ) : (
        <DataGrid<TrainingRow>
          rows={trainings}
          columns={columns}
          getRowId={(row) => row.id} // Uniikki id DataGridille
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Training</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date"
              value={newTraining.date ?? dayjs()}
              onChange={(newValue) =>
                setNewTraining((prev) => ({
                  ...prev,
                  date: newValue ?? dayjs(),
                }))
              }
            />
          </LocalizationProvider>

          <TextField
            label="Activity"
            value={newTraining.activity ?? ""}
            onChange={(e) =>
              setNewTraining((prev) => ({ ...prev, activity: e.target.value }))
            }
          />

          <TextField
            label="Duration (min)"
            type="number"
            value={newTraining.duration ?? 0}
            onChange={(e) =>
              setNewTraining((prev) => ({
                ...prev,
                duration: Number(e.target.value) || 0,
              }))
            }
          />

          <Select
            value={newTraining.customerId ?? 0}
            onChange={(e) =>
              setNewTraining((prev) => ({
                ...prev,
                customerId:
                  typeof e.target.value === "string"
                    ? parseInt(e.target.value, 10)
                    : e.target.value,
              }))
            }
            fullWidth
            displayEmpty
          >
            <MenuItem value={0}>
              <em>Select Customer</em>
            </MenuItem>

            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.firstname} {c.lastname}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTraining} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
