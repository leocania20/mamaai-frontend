import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import 'dayjs/locale/pt'; // se quiser usar português
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export default function ChatMae({ usuario }) {
  const [especialistas, setEspecialistas] = useState([]);
  const [especialistaAtivo, setEspecialistaAtivo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');

  // 📌 Listar todos os especialistas aprovados
  useEffect(() => {
    async function fetchEspecialistas() {
      const { data, error } = await supabase
        .from('especialistas')
        .select('id, area_especializacao, biografia, usuario_id, usuarios (nome, data_nascimento)')
        .eq('aprovado', true);

      if (data) setEspecialistas(data);
    }

    fetchEspecialistas();
  }, []);
 

  // 📨 Carregar mensagens com especialista selecionado
  useEffect(() => {
    if (!especialistaAtivo) return;

    async function fetchMensagens() {
      const { data } = await supabase
        .from('mensagens_chat')
        .select('*')
        .or(`remetente_id.eq.${usuario.id},destinatario_id.eq.${usuario.id}`)
        .order('enviada_em');

      const filtradas = data.filter(m =>
        [m.remetente_id, m.destinatario_id].includes(especialistaAtivo.usuario_id)
      );

      setMensagens(filtradas);
    }

    fetchMensagens();

    const canal = supabase
      .channel('chat_mensagens')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens_chat'
      }, fetchMensagens)
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, [especialistaAtivo]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;
    if (!usuario || !especialistaAtivo) return;
    await supabase.from('mensagens_chat').insert({
      remetente_id: usuario.id,
      destinatario_id: especialistaAtivo.usuario_id,
      mensagem: novaMensagem
    });
    setNovaMensagem('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Especialistas disponíveis</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {especialistas.map((esp) => {
          const idade = esp.usuarios?.data_nascimento
            ? dayjs().diff(esp.usuarios.data_nascimento, 'year')
            : '-';

          return (
            <div key={esp.id} className="bg-white shadow-md rounded-lg p-5 transition-transform duration-300 hover:scale-[1.02]">
              <h2 className="text-lg font-semibold">{esp.usuarios.nome}</h2>
              <p className="text-sm text-gray-600">Idade: {idade}</p>
              <p className="text-sm text-gray-600 mt-1"><strong>Especialização:</strong> {esp.area_especializacao}</p>
              <p className="text-sm text-gray-800 mt-2">{esp.biografia}</p>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => setEspecialistaAtivo(esp)}
              >
                Iniciar conversa
              </button>
            </div>
          );
        })}
      </div>

      {/* 🧾 Chat */}
      {especialistaAtivo && (
        <div className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-white border-l shadow-2xl z-50 transition-all duration-500 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chat com {especialistaAtivo.usuarios.nome}</h2>
            <button onClick={() => setEspecialistaAtivo(null)} className="text-red-600 hover:underline">Fechar</button>
          </div>

          <div className="h-96 overflow-y-scroll bg-gray-100 p-4 rounded">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 max-w-[70%] p-2 rounded ${
                  msg.remetente_id === usuario.id ? 'ml-auto bg-green-200 text-right' : 'bg-blue-200'
                }`}
              >
                {msg.mensagem}
              </div>
            ))}
          </div>

          <div className="mt-4 flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l px-3 py-2"
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
              onClick={enviarMensagem}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
