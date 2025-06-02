// src/pages/Acompanhamento.jsx
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


export default function Acompanhamento() {

  const navigate = useNavigate();
  
  const [gravidez, setGravidez] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    semana: "",
    peso: "",
    sintomas: "",
    mal_estar: "",
    observacoes: "",
    pressao_arterial: "",
    temperatura: "",
    nivel_diabete: "",
    toma_medicamento: false,
    nome_medicamento: "",
  });
   
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: gravidezData } = await supabase
        .from("gravidezes")
        .select("*")
        .eq("id_mae", userId)
        .maybeSingle();
      setGravidez(gravidezData);

      const { data: registrosData } = await supabase
        .from("acompanhamentos")
        .select("*")
        .eq("id_mae", userId)
        .order("semana", { ascending: true });

      setRegistros(registrosData);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await supabase.from("acompanhamentos").insert([{
      id_mae: userId,
      ...form,
    }]);

    if (error) {
      console.error("Erro ao registrar:", error);
    } else {
      alert("Registro feito com sucesso!");
      setForm({
        semana: "",
        peso: "",
        sintomas: "",
        mal_estar: "",
        observacoes: "",
        pressao_arterial: "",
        temperatura: "",
        nivel_diabete: "",
        toma_medicamento: false,
        nome_medicamento: "",
      });
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
       <Header />
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-pink-600">🤱 Acompanhamento da Gravidez</h1>
        <p className="text-gray-600">Veja o progresso do seu bebê semana a semana.</p>
      </header>

      {/* Simulação de imagem */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-center"
      >
        <img
          src="/simulacao-bebe-placeholder.png"
          alt="Simulação do bebê"
          className="w-full max-w-md rounded-lg shadow-lg border"
        />
      </motion.div>

      {/* Dados da Gravidez */}
      {gravidez ? (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <p><strong>Data de Início:</strong> {new Date(gravidez.data_inicio).toLocaleDateString()}</p>
          <p><strong>Semana Atual:</strong> {gravidez.semanas}</p>
          <p><strong>DPP:</strong> {new Date(gravidez.dpp).toLocaleDateString()}</p>
        </div>
      ) : (
        <p>Carregando dados...</p>
      )}

      {/* Botão para novo registro */}
      <div className="text-right mb-4">
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded shadow"
          onClick={() => setIsModalOpen(true)}
        >
          + Novo Registro Semanal
        </button>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-30 p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4">Registrar Semana</Dialog.Title>
            <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <input type="number" placeholder="Semana" value={form.semana} onChange={e => setForm({ ...form, semana: e.target.value })} className="border p-2 rounded" required />
              <input type="text" placeholder="Peso (ex: 65kg)" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Sintomas" value={form.sintomas} onChange={e => setForm({ ...form, sintomas: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Mal-estar" value={form.mal_estar} onChange={e => setForm({ ...form, mal_estar: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Pressão Arterial" value={form.pressao_arterial} onChange={e => setForm({ ...form, pressao_arterial: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Temperatura" value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} className="border p-2 rounded" />
              <input type="text" placeholder="Nível de Diabete" value={form.nivel_diabete} onChange={e => setForm({ ...form, nivel_diabete: e.target.value })} className="border p-2 rounded" />
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" checked={form.toma_medicamento} onChange={e => setForm({ ...form, toma_medicamento: e.target.checked })} />
                <label>Está a tomar medicamentos?</label>
              </div>
              {form.toma_medicamento && (
                <input type="text" placeholder="Nome do Medicamento" value={form.nome_medicamento} onChange={e => setForm({ ...form, nome_medicamento: e.target.value })} className="border p-2 rounded col-span-2" />
              )}
              <textarea placeholder="Observações" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} className="border p-2 rounded col-span-2"></textarea>
              <div className="col-span-2 text-right">
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Histórico */}
      <h3 className="text-xl font-semibold mb-4">📘 Histórico de Registros</h3>
      {registros.length > 0 ? (
        <div className="grid gap-4">
          {registros.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded shadow p-4"
            >
              <p><strong>Semana:</strong> {r.semana}</p>
              <p><strong>Peso:</strong> {r.peso}</p>
              <p><strong>Sintomas:</strong> {r.sintomas}</p>
              <p><strong>Mal-estar:</strong> {r.mal_estar}</p>
              <p><strong>Pressão Arterial:</strong> {r.pressao_arterial}</p>
              <p><strong>Temperatura:</strong> {r.temperatura}</p>
              <p><strong>Diabete:</strong> {r.nivel_diabete}</p>
              {r.toma_medicamento && <p><strong>Medicamento:</strong> {r.nome_medicamento}</p>}
              <p><strong>Observações:</strong> {r.observacoes}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum registro ainda.</p>
      )}
    </div>
  );
}
