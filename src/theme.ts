import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#22c55e",
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
            backgroundColor: "#f0fdf4", 
          },
        },
      },
    },
  },
});

export default theme;
