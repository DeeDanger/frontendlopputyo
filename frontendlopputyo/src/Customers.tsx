import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Customer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  streetaddress: string;
  city: string;
  postcode: string;
  _links: any;
}

interface CustomerForm {
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
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null
  );
  const [newCustomer, setNewCustomer] = useState<CustomerForm>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    streetaddress: "",
    city: "",
    postcode: "",
  });

  // Hae asiakkaat
  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers"
    )
      .then((res) => res.json())
      .then((data) => setCustomers(data._embedded.customers));
  }, []);

  const handleSaveCustomer = () => {
    if (editingCustomerId) {
      // Muokkaus
      fetch(
        `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${editingCustomerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomer),
        }
      )
        .then((res) => res.json())
        .then((updated) => {
          setCustomers((prev) =>
            prev.map((c) =>
              c._links.self.href.endsWith(`/${editingCustomerId}`)
                ? { ...updated, _links: c._links }
                : c
            )
          );
          setOpenDialog(false);
          setEditingCustomerId(null);
        });
    } else {
      // Uusi asiakas
      fetch(
        "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomer),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          // Lisää _links kenttä, jotta DataGrid voi käyttää id:tä
          setCustomers((prev) => [
            ...prev,
            {
              ...data,
              _links: { self: { href: data._links?.self?.href || "#" } },
            },
          ]);
          setOpenDialog(false);
        });
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setNewCustomer(customer);
    setEditingCustomerId(Number(customer._links.self.href.split("/").pop()));
    setOpenDialog(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This will also delete all associated trainings."
      )
    )
      return;
    const id = Number(customer._links.self.href.split("/").pop());
    fetch(
      `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${id}`,
      { method: "DELETE" }
    ).then(() =>
      setCustomers((prev) =>
        prev.filter((c) => c._links.self.href !== customer._links.self.href)
      )
    );
  };

  const columns: GridColDef[] = [
    { field: "firstname", headerName: "First Name", flex: 1 },
    { field: "lastname", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "streetaddress", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "postcode", headerName: "Postcode", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditCustomer(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteCustomer(params.row)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: "80vh", width: "100%", p: 3 }}>
      <h1 style={{ fontFamily: "sans-serif" }}>Customers</h1>
      <Button
        onClick={() => setOpenDialog(true)}
        variant="contained"
        sx={{ mb: 2 }}
      >
        Add Customer
      </Button>

      <DataGrid
        rows={customers}
        columns={columns}
        getRowId={(row) => Number(row._links.self.href.split("/").pop())}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setEditingCustomerId(null);
        }}
      >
        <DialogTitle>
          {editingCustomerId ? "Edit Customer" : "Add Customer"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {Object.keys(newCustomer).map((key) => (
            <TextField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={newCustomer[key as keyof CustomerForm]}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              setEditingCustomerId(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveCustomer} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
