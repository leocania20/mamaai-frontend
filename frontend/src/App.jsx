import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingScreen from "./pages/LoadingScreen";
import Login from "./pages/Login"; 
import MaeDashboard from "./pages/dashboard/MaeDashboard";
import EspecialistaDashboard from "./pages/dashboard/EspecialistaDashboard";
import Acompanhamento from "./pages/Acompanhamento";
import PerfilPage from "./pages/PerfilPage";
import ChatMae from "./pages/ChatMae";
import CadastroGravidez from "./pages/CadastroGravidez";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />

        <Route path="/login" element={<Login />} />
        <Route path="/acompanhamento" element={<Acompanhamento />} />
        <Route path="/chatmae" element={<ChatMae/>} />
        <Route path="/especialistaDashboard" element={<EspecialistaDashboard/>} />
        
        <Route path="/PerfilPage" element={<PerfilPage />} />
        <Route path="/cadastro-gravidez" element={<CadastroGravidez />} />
        <Route
          path="/dashboard/mae"
          element={
            <PrivateRoute>
              <MaeDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/especialista"
          element={
            <PrivateRoute>
              <EspecialistaDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
