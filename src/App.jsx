import { ThemeProvider } from "./shared/theme/ThemeContext";
import Router from "./shared/components/router";

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}
