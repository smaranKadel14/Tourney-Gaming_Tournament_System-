import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./components/routes/AppRoutes";

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;