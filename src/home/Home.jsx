import { Box, Toolbar } from "@mui/material";
import Navbar from "../shared/components/Navbar";
import HeroSection from "./components/HeroSection";

export default function Home() {
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
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeroSection />
      </Box>
    </Box>
  );
}
