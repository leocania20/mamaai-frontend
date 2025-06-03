import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient"; // certifique-se de que esse caminho está certo
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
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    async function carregarUsuario() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUsuario({
          id: data.user.id,
          email: data.user.email,
          ...data.user.user_metadata, // caso você salve nome, tipo, etc.
        });
      }
    }

    carregarUsuario();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />

        <Route path="/login" element={<Login />} />
        <Route path="/acompanhamento" element={<Acompanhamento />} />
        <Route path="/chatmae" element={<ChatMae usuario={usuario} />} />
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
