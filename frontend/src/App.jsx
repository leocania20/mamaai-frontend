import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import LoadingScreen from "./pages/LoadingScreen";
import Login from "./pages/Login";
import MaeDashboard from "./pages/dashboard/MaeDashboard";
import EspecialistaDashboard from "./pages/dashboard/EspecialistaDashboard";
import Acompanhamento from "./pages/Acompanhamento";
import PerfilPage from "./pages/PerfilPage";
import ChatMae from "./pages/ChatMae";
import CadastroGravidez from "./pages/CadastroGravidez";
import InteligenciaArtificial from "./pages/InteligenciaArtificial";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        setLoadingAuth(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erro ao obter a sessão:", error);
        }
        setUsuario(data?.session?.user || null);
      } finally {
        setLoadingAuth(false);
      }
    }
    carregarUsuario();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de autenticação:", event, session);
      setUsuario(session?.user || null);
      setLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      {loadingAuth ? (
        <LoadingScreen />
      ) : (
        <Routes>
          <Route
            path="/"
            element={usuario ? <Navigate to="/dashboard/mae" /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard/mae"
            element={usuario ? <MaeDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/especialista"
            element={usuario ? <EspecialistaDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard/admin"
            element={usuario ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route path="/acompanhamento" element={usuario ? <Acompanhamento /> : <Navigate to="/login" />} />
          <Route path="/inteligencia-artificial" element={usuario ? <InteligenciaArtificial /> : <Navigate to="/login" />} />
          <Route path="/chatmae" element={usuario ? <ChatMae usuario={usuario} /> : <Navigate to="/login" />} />
          <Route path="/PerfilPage" element={usuario ? <PerfilPage /> : <Navigate to="/login" />} />
          <Route path="/cadastro-gravidez" element={usuario ? <CadastroGravidez /> : <Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;