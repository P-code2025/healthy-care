// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#22c55e", // xanh lá
      contrastText: "#ffffff",
    },
    background: {
      default: "#f3f4f6",
      paper: "#ffffff",
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#ffffff",
            color: "#22c55e",
            fontWeight: 600,
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#f0fdf4", // hover nhẹ xanh lá nhạt
          },
        },
      },
    },
  },
});

export default theme;
