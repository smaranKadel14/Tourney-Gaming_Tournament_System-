import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// importing pages
import Login from "../auth/Login";
import Signup from "../auth/Signup";

/*
  AppRoutes handles all frontend navigation.
  Keeping routes separated makes the project cleaner and easier to scale later.
*/

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* default route -> login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
