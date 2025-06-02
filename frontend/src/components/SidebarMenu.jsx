import { supabase } from "../../src/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SidebarMenu({ secaoAtiva, setSecaoAtiva }) {
  const navigate = useNavigate();
  const [visivel, setVisivel] = useState(true);

  const sair = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleClick = (chave) => {
    setSecaoAtiva(chave);
    setVisivel(false); // fecha o menu
  };

  const itens = [
    { chave: "perfil", label: "👤 Editar Perfil" },
    { chave: "pais", label: "👨‍👩‍👧 Dados dos Pais" },
    { chave: "gravidez", label: "🤰 Gravidez" },
  ];

  return (
    <>
      {visivel ? (
        <div className="w-64 bg-white shadow-xl fixed right-0 top-0 h-full p-6 z-50 border-l">
          <h2 className="text-xl font-bold mb-8 text-pink-600">⚙️ Meu Perfil</h2>
          <ul className="space-y-4">
            {itens.map((item) => (
              <li key={item.chave}>
                <button
                  onClick={() => handleClick(item.chave)}
                  className={`w-full text-left px-3 py-2 rounded transition ${
                    secaoAtiva === item.chave
                      ? "bg-pink-100 text-pink-700 font-semibold"
                      : "hover:bg-pink-50 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="absolute bottom-6 right-6 left-6">
            <button
              onClick={sair}
              className="w-full bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      ) : (
        // Botão flutuante para reabrir o menu
        <button
          onClick={() => setVisivel(true)}
          className="fixed top-4 right-4 bg-pink-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-pink-700 transition"
          title="Abrir Menu"
        >
          ☰
        </button>
      )}
    </>
  );
}
