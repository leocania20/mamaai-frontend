
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "/src/supabaseClient";
import { motion } from "framer-motion";
import { FaUsers, FaFileAlt, FaChartBar, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import Header from "../../components/Header";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [contents, setContents] = useState([]);
  const [userStats, setUserStats] = useState({ mae: 0, especialista: 0, admin: 0 });
  const [newUser, setNewUser] = useState({ nome: "", email: "", senha: "", tipo_usuario: "mae" });
  const [newContent, setNewContent] = useState({ titulo: "", imagem: "", descricao: "", conteudo: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
      else {
        const { data: userData } = await supabase.from("usuarios").select("tipo_usuario").eq("id", session.user.id).single();
        if (userData.tipo_usuario !== "admin") navigate("/login");
      }
    };
    checkSession();
    fetchUsers();
    fetchContents();
    fetchUserStats();
  }, [navigate]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("usuarios").select("*");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data);
  };

  const fetchContents = async () => {
    const { data, error } = await supabase.from("conteudo").select("*");
    if (error) console.error("Error fetching contents:", error);
    else setContents(data);
  };

  const fetchUserStats = async () => {
    const { data, error } = await supabase.from("usuarios").select("tipo_usuario");
    if (error) console.error("Error fetching user stats:", error);
    else {
      const stats = data.reduce(
        (acc, user) => ({
          ...acc,
          [user.tipo_usuario]: acc[user.tipo_usuario] + 1,
        }),
        { mae: 0, especialista: 0, admin: 0 }
      );
      setUserStats(stats);
    }
  };

  const handleCreateUser = async () => {
    const { error } = await supabase.from("usuarios").insert([newUser]);
    if (error) console.error("Error creating user:", error);
    else {
      fetchUsers();
      setNewUser({ nome: "", email: "", senha: "", tipo_usuario: "mae" });
      setShowUserModal(false);
    }
  };

  const handleUpdateUser = async () => {
    const { error } = await supabase.from("usuarios").update(editingUser).eq("id", editingUser.id);
    if (error) console.error("Error updating user:", error);
    else {
      fetchUsers();
      setEditingUser(null);
      setShowUserModal(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      const { error } = await supabase.from("usuarios").delete().eq("id", id);
      if (error) console.error("Error deleting user:", error);
      else fetchUsers();
    }
  };

  const handleCreateContent = async () => {
    const { error } = await supabase.from("conteudo").insert([newContent]);
    if (error) console.error("Error creating content:", error);
    else {
      fetchContents();
      setNewContent({ titulo: "", imagem: "", descricao: "", conteudo: "" });
      setShowContentModal(false);
    }
  };

  const handleUpdateContent = async () => {
    const { error } = await supabase.from("conteudo").update(editingContent).eq("id", editingContent.id);
    if (error) console.error("Error updating content:", error);
    else {
      fetchContents();
      setEditingContent(null);
      setShowContentModal(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este conteúdo?")) {
      const { error } = await supabase.from("conteudo").delete().eq("id", id);
      if (error) console.error("Error deleting content:", error);
      else fetchContents();
    }
  };

  const chartData = {
    labels: ["Mães", "Especialistas", "Administradores"],
    datasets: [
      {
        label: "Número de Usuários",
        data: [userStats.mae, userStats.especialista, userStats.admin],
        backgroundColor: ["#f472b6", "#10b981", "#3b82f6"],
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Usuários por Tipo", font: { size: 16, weight: "bold" } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.h2
          className="text-4xl font-extrabold text-gray-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Painel do Administrador
        </motion.h2>

        {/* Chart Section */}
        <section className="mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartBar className="text-blue-500" /> Estatísticas
            </h3>
            <div className="h-48">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        </section>

        {/* User Management */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-blue-500" /> Usuários
            </h3>
            <motion.button
              onClick={() => setShowUserModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:from-blue-600 hover:to-blue-700 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus /> Novo Usuário
            </motion.button>
          </div>
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="p-4 font-semibold">Nome</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50 transition duration-150">
                    <td className="p-4">{user.nome}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.tipo_usuario === "mae"
                            ? "bg-pink-100 text-pink-600"
                            : user.tipo_usuario === "especialista"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {user.tipo_usuario}
                      </span>
                    </td>
                    <td className="p-4 flex gap-3">
                      <motion.button
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        whileHover={{ scale: 1.2 }}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                        whileHover={{ scale: 1.2 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* Content Management */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <FaFileAlt className="text-green-500" /> Conteúdos
            </h3>
            <motion.button
              onClick={() => setShowContentModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:from-green-600 hover:to-green-700 transition duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus /> Novo Conteúdo
            </motion.button>
          </div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {contents.map((content) => (
              <motion.div
                key={content.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img src={content.imagem} alt={content.titulo} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <h4 className="font-semibold text-gray-800 text-lg">{content.titulo}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{content.descricao}</p>
                  <div className="flex gap-3 mt-3">
                    <motion.button
                      onClick={() => {
                        setEditingContent(content);
                        setShowContentModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      whileHover={{ scale: 1.2 }}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteContent(content.id)}
                      className="text-red-500 hover:text-red-700"
                      whileHover={{ scale: 1.2 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* User Modal */}
        {showUserModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingUser ? "Editar Usuário" : "Adicionar Usuário"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={editingUser ? editingUser.nome : newUser.nome}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, nome: e.target.value })
                      : setNewUser({ ...newUser, nome: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={editingUser ? editingUser.senha : newUser.senha}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, senha: e.target.value })
                      : setNewUser({ ...newUser, senha: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={editingUser ? editingUser.tipo_usuario : newUser.tipo_usuario}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, tipo_usuario: e.target.value })
                      : setNewUser({ ...newUser, tipo_usuario: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mae">Mãe</option>
                  <option value="especialista">Especialista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition duration-200"
                >
                  {editingUser ? "Salvar" : "Criar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Content Modal */}
        {showContentModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {editingContent ? "Editar Conteúdo" : "Adicionar Conteúdo"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título"
                  value={editingContent ? editingContent.titulo : newContent.titulo}
                  onChange={(e) =>
                    editingContent
                      ? setEditingContent({ ...editingContent, titulo: e.target.value })
                      : setNewContent({ ...newContent, titulo: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="URL da Imagem"
                  value={editingContent ? editingContent.imagem : newContent.imagem}
                  onChange={(e) =>
                    editingContent
                      ? setEditingContent({ ...editingContent, imagem: e.target.value })
                      : setNewContent({ ...newContent, imagem: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="Descrição"
                  value={editingContent ? editingContent.descricao : newContent.descricao}
                  onChange={(e) =>
                    editingContent
                      ? setEditingContent({ ...editingContent, descricao: e.target.value })
                      : setNewContent({ ...newContent, descricao: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                />
                <textarea
                  placeholder="Conteúdo"
                  value={editingContent ? editingContent.conteudo : newContent.conteudo}
                  onChange={(e) =>
                    editingContent
                      ? setEditingContent({ ...editingContent, conteudo: e.target.value })
                      : setNewContent({ ...newContent, conteudo: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowContentModal(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingContent ? handleUpdateContent : handleCreateContent}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition duration-200"
                >
                  {editingContent ? "Salvar" : "Criar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}