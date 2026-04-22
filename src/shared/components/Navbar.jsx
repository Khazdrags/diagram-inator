import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useColorMode } from "../theme/ThemeContext";

const navItems = [
  { label: "Home", icon: <HomeOutlinedIcon fontSize="small" />, path: "/" },
  {
    label: "New Diagram",
    icon: <AddCircleOutlinedIcon fontSize="small" />,
    path: "/diagram",
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Brand */}
        <Typography
          sx={{
            color: "#1ed760",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "-0.3px",
            userSelect: "none",
            mr: 3,
            flexShrink: 0,
          }}
        >
          Diagram-inator
        </Typography>

        {/* Nav links */}
        <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
          {navItems.map(({ label, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Button
                key={path}
                onClick={() => navigate(path)}
                startIcon={icon}
                sx={{
                  color: isActive ? "text.primary" : "text.secondary",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "14px",
                  letterSpacing: "0.4px",
                  textTransform: "none",
                  borderRadius: "9999px",
                  px: 2,
                  "&:hover": {
                    color: "text.primary",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>

        {/* Theme toggle */}
        <Tooltip
          title={
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <IconButton
            onClick={toggleColorMode}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            {mode === "dark" ? (
              <LightModeOutlinedIcon />
            ) : (
              <DarkModeOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
