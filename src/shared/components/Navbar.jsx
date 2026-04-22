import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tooltip,
  Box,
} from "@mui/material";
import { Home, Moon, PlusCircle, Sun } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useColorMode } from "../theme/ThemeContext";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "New Diagram", path: "/diagram", icon: PlusCircle },
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
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Button
                key={path}
                onClick={() => navigate(path)}
                startIcon={<Icon size={16} strokeWidth={2.25} />}
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
          <Button
            onClick={toggleColorMode}
            size="small"
            startIcon={
              mode === "dark" ? (
                <Sun size={16} strokeWidth={2.25} />
              ) : (
                <Moon size={16} strokeWidth={2.25} />
              )
            }
            sx={{
              minWidth: 96,
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "9999px",
              px: 1.5,
              "&:hover": {
                color: "text.primary",
                borderColor: "text.secondary",
              },
            }}
          >
            {mode === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
