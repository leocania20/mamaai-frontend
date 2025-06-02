import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { motion } from "framer-motion";
import { FaBaby, FaHeartbeat, FaComments, FaAppleAlt } from "react-icons/fa";

const conteudos = [
  {
    id: 1,
    titulo: "Alimentação saudável na gravidez",
    imagem: "https://via.placeholder.com/300x200",
    descricao: "Descubra os alimentos essenciais para o bem-estar da mãe e do bebé.",
    conteudo: "Durante a gravidez, é essencial manter uma alimentação rica em vitaminas, proteínas e minerais. Evite alimentos processados, açúcar em excesso e bebidas com cafeína.",
  },
  {
    id: 2,
    titulo: "Exercícios leves para gestantes",
    imagem: "https://via.placeholder.com/300x200",
    descricao: "Aprenda exercícios seguros e benéficos durante a gravidez.",
    conteudo: "Exercícios como caminhada, ioga e alongamentos ajudam a manter o corpo ativo, reduzem o estresse e melhoram a circulação.",
  },
  {
    id: 3,
    titulo: "Como lidar com as emoções na gestação",
    imagem: "https://via.placeholder.com/300x200",
    descricao: "Estratégias para lidar com ansiedade, mudanças de humor e muito mais.",
    conteudo: "A gravidez pode causar flutuações emocionais. Técnicas de respiração, diálogo com o parceiro e suporte psicológico são fundamentais.",
  },
];

export default function MaeDashboard() {
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

  const features = [
    {
      icon: <FaBaby className="text-pink-600 text-5xl" />,
      title: "Acompanhamento da Gravidez",
      onClick: () => navigate("/acompanhamento"),
    },
    {
      icon: <FaAppleAlt className="text-green-600 text-5xl" />,
      title: "Nutrição",
      onClick: () => alert("Nutrição"),
    },
    {
      icon: <FaHeartbeat className="text-red-500 text-5xl" />,
      title: "Calendário Menstrual",
      onClick: () => alert("Calendário Menstrual"),
    },
    {
      icon: <FaComments className="text-purple-500 text-5xl" />,
      title: "Chat com Especialistas",
      onClick: () => navigate("/chatmae"),
    },
  ];

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />

      {/* Funcionalidades */}
      <section className="px-6 py-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Funcionalidades</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={index}
              onClick={item.onClick}
              className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg"
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                {item.icon}
                <h4 className="font-semibold text-center text-gray-800 text-lg">{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Conteúdos recomendados */}
      <main className="px-6 pb-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Conteúdos recomendados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {conteudos.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedContent(item)}
              className="bg-white shadow rounded-lg overflow-hidden cursor-pointer"
            >
              <img src={item.imagem} alt={item.titulo} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-semibold text-gray-800">{item.titulo}</h4>
                <p className="text-sm text-gray-600">{item.descricao}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal de conteúdo */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white w-full max-w-lg rounded-lg p-6 shadow-lg relative">
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-2 right-4 text-gray-500 text-xl"
            >
              ×
            </button>
            <img src={selectedContent.imagem} alt={selectedContent.titulo} className="w-full h-48 object-cover rounded" />
            <h2 className="text-xl font-bold mt-4 text-pink-600">{selectedContent.titulo}</h2>
            <p className="mt-2 text-gray-700">{selectedContent.conteudo}</p>
          </div>
        </div>
      )}
    </div>
  );
}
