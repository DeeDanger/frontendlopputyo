import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Customers from "./Customers";
import Trainings from "./Trainings";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" component={Link} to="/customers">
              Customers
            </Button>
            <Button color="inherit" component={Link} to="/trainings">
              Trainings
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/customers" element={<Customers />} />
        <Route path="/trainings" element={<Trainings />} />
      </Routes>
    </Router>
  );
}
