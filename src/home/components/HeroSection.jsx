import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import doofImage from "../../shared/assets/home/doof.png";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 4,
        pb: { xs: 12, md: 6 },
        gap: 3,
      }}
    >
      <Box sx={{ maxWidth: 700 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "32px", md: "48px" },
            fontWeight: 700,
            lineHeight: 1.1,
            mb: 2,
            color: "text.primary",
          }}
        >
          Behold, the Diagram-inator!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: "16px",
            color: "text.secondary",
            lineHeight: 1.6,
            mb: 4,
          }}
        >
          Design, share and collaborate on diagrams with ease.
          <br />
          Start from scratch or pick a template.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/diagram")}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            borderRadius: "9999px",
            boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
            "&:hover": {
              boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
              filter: "brightness(1.1)",
            },
          }}
        >
          Create new diagram
        </Button>
      </Box>

      <Box
        component="img"
        src={doofImage}
        alt="Home decoration"
        sx={{
          position: "absolute",
          right: 10,
          bottom: 0,
          width: { xs: 96, md: 250 },
          height: "auto",
          objectFit: "contain",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </Box>
  );
}
