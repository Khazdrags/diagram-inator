import { Box, Toolbar } from "@mui/material";
import Navbar from "../shared/components/Navbar";
import DiagramCanvas from "./components/DiagramCanvas";
import "./styles/diagram.css";

export default function DiagramPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Navbar />
      <Toolbar />

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 1.5, md: 2 },
          minHeight: 0,
        }}
      >
        <DiagramCanvas />
      </Box>
    </Box>
  );
}
