import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function AdminDashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("nome")
          .eq("email", user.email)
          .single();

        if (!error) setUserInfo(data);
      } else {
        navigate("/");
      }
    }

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Painel do Administrador</h1>
        {userInfo && <p className="mb-4">Olá, {userInfo.nome}!</p>}
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
