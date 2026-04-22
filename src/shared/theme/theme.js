import { createTheme } from "@mui/material/styles";

const fontFamily = [
  "SpotifyMixUI",
  "Helvetica Neue",
  "helvetica",
  "arial",
  "sans-serif",
].join(",");

const sharedTypography = {
  fontFamily,
  h1: { fontFamily, fontWeight: 700, fontSize: "24px", lineHeight: "normal" },
  h2: { fontFamily, fontWeight: 600, fontSize: "18px", lineHeight: 1.3 },
  h3: { fontFamily, fontWeight: 700, fontSize: "16px", lineHeight: "normal" },
  body1: {
    fontFamily,
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "normal",
  },
  body2: {
    fontFamily,
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "normal",
    color: "#b3b3b3",
  },
  button: {
    fontFamily,
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: 1,
    letterSpacing: "1.4px",
    textTransform: "uppercase",
  },
  caption: { fontFamily, fontWeight: 400, fontSize: "12px", lineHeight: 1.5 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "9999px",
        padding: "8px 24px",
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: "8px", border: "none" },
    },
  },
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1ed760",
      contrastText: "#000000",
    },
    background: {
      default: "#121212",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
    error: { main: "#f3727f" },
    warning: { main: "#ffa42b" },
    info: { main: "#539df5" },
    divider: "#4d4d4d",
  },
  typography: sharedTypography,
  shape: { borderRadius: 8 },
  components: {
    ...sharedComponents,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#121212",
          borderRight: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          "&.Mui-selected": {
            backgroundColor: "transparent",
            "& .MuiListItemText-primary": { fontWeight: 700, color: "#ffffff" },
            "& .MuiListItemIcon-root": { color: "#ffffff" },
          },
          "&:hover": { backgroundColor: "rgba(255,255,255,0.07)" },
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1ed760",
      contrastText: "#000000",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#181818",
      secondary: "#555555",
    },
    error: { main: "#f3727f" },
    warning: { main: "#ffa42b" },
    info: { main: "#539df5" },
    divider: "#e0e0e0",
  },
  typography: sharedTypography,
  shape: { borderRadius: 8 },
  components: {
    ...sharedComponents,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e0e0e0",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          "&.Mui-selected": {
            backgroundColor: "transparent",
            "& .MuiListItemText-primary": { fontWeight: 700, color: "#181818" },
            "& .MuiListItemIcon-root": { color: "#181818" },
          },
          "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
        },
      },
    },
  },
});
