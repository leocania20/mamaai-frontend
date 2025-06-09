import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Header from "../components/Header";
import dayjs from 'dayjs';
import 'dayjs/locale/pt';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('pt');
dayjs.extend(relativeTime);

export default function ChatMae({ usuario }) {
  const [especialistas, setEspecialistas] = useState([]);
  const [especialistaAtivo, setEspecialistaAtivo] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [especialistasComConversa, setEspecialistasComConversa] = useState([]);

  useEffect(() => {
    async function fetchEspecialistas() {
      const { data, error } = await supabase
        .from('especialistas')
        .select('id, area_especializacao, biografia, usuario_id, usuarios (nome, data_nascimento)')
        .eq('aprovado', true);

      if (error) {
        console.error('Erro ao buscar especialistas:', error.message);
        return;
      }

      setEspecialistas(data);
    }

    async function fetchConversasAnteriores() {
      if (!usuario) return;

      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('remetente_id, destinatario_id');

      if (error) {
        console.error('Erro ao buscar mensagens:', error.message);
        return;
      }

      const ids = new Set();
      data.forEach((msg) => {
        if (msg.remetente_id === usuario.id) {
          ids.add(msg.destinatario_id);
        } else if (msg.destinatario_id === usuario.id) {
          ids.add(msg.remetente_id);
        }
      });

      setEspecialistasComConversa(Array.from(ids));
    }

    fetchEspecialistas();
    fetchConversasAnteriores();
  }, [usuario]);

  useEffect(() => {
    if (!especialistaAtivo || !usuario) return;

    async function fetchMensagens() {
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('*')
        .or(
          `and(remetente_id.eq.${usuario.id},destinatario_id.eq.${especialistaAtivo.usuario_id}),and(remetente_id.eq.${especialistaAtivo.usuario_id},destinatario_id.eq.${usuario.id})`
        )
        .order('enviada_em', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error.message);
        return;
      }

      setMensagens(data);
    }

    fetchMensagens();

    const canal = supabase
      .channel('chat_mensagens')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_chat',
        },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.remetente_id === usuario.id && msg.destinatario_id === especialistaAtivo.usuario_id) ||
            (msg.remetente_id === especialistaAtivo.usuario_id && msg.destinatario_id === usuario.id)
          ) {
            setMensagens((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [especialistaAtivo, usuario]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !usuario?.id || !especialistaAtivo?.usuario_id) return;

    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert({
        remetente_id: usuario.id,
        destinatario_id: especialistaAtivo.usuario_id,
        mensagem: novaMensagem,
      })
      .select();

    if (error) {
      console.error('Erro ao enviar mensagem:', error.message);
      alert('Erro ao enviar mensagem: ' + error.message);
      return;
    }

    setMensagens((prev) => [...prev, data[0]]);
    setNovaMensagem('');
  };

  const iniciarConversa = async (esp) => {
  if (!usuario?.id || !esp?.id) {
    console.error("Usuário ou especialista inválido:", usuario, esp);
    return;
  }

  // Buscar o ID da mãe baseado no usuario.id
  const { data: maeData, error: maeError } = await supabase
  .from('maes')
  .select('id')
  .eq('usuario_id', usuario.id)
  .maybeSingle();

if (maeError) {
  console.error('Erro ao buscar dados da mãe:', maeError.message);
  return;
}

if (!maeData) {
  console.warn('Nenhuma mãe encontrada para esse usuário.');
  return;
}

console.log('Mãe encontrada:', maeData);


  const maeId = maeData.id;

  // Verificar se já existe associação
  const { data: existente, error: fetchError } = await supabase
    .from('mae_especialista')
    .select('*')
    .eq('mae_id', maeId)
    .eq('especialista_id', esp.id);

  if (fetchError) {
    console.error('Erro ao verificar associação:', fetchError.message);
    return;
  }

  if (!existente || existente.length === 0) {
    const { error: insertError } = await supabase.from('mae_especialista').insert({
      mae_id: maeId,
      especialista_id: esp.id,
    });

    if (insertError) {
      console.error('Erro ao associar mãe e especialista:', insertError.message);
      return;
    }

    console.log('Associação mãe-especialista criada com sucesso');
  }

  setEspecialistaAtivo(esp);
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
          const temConversa = especialistasComConversa.includes(esp.usuario_id);

          return (
            <div
              key={esp.id}
              className="bg-white shadow-md rounded-lg p-5 transition-transform duration-300 hover:scale-[1.02]"
            >
              <h2 className="text-lg font-semibold">{esp.usuarios.nome}</h2>
              <p className="text-sm text-gray-600">Idade: {idade}</p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Especialização:</strong> {esp.area_especializacao}
              </p>
              <p className="text-sm text-gray-800 mt-2">{esp.biografia}</p>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => iniciarConversa(esp)}
              >
                {temConversa ? 'Continuar conversa' : 'Iniciar conversa'}
              </button>
            </div>
          );
        })}
      </div>

      {especialistaAtivo && (
        <div className="fixed inset-0 md:right-0 md:left-auto md:w-1/2 w-full h-full bg-white border-l shadow-2xl z-50 transition-all duration-500 overflow-y-auto p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">💬 Chat com {especialistaAtivo.usuarios.nome}</h2>
            <button onClick={() => setEspecialistaAtivo(null)} className="text-red-600 hover:underline">
              Fechar
            </button>
          </div>

          <div className="h-[65vh] overflow-y-scroll bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 rounded-lg shadow-inner">
            {mensagens.map((msg) => {
              const isRemetente = msg.remetente_id === usuario.id;
              const hora = dayjs(msg.enviada_em).format('HH:mm');
              const nome = isRemetente ? 'Você' : especialistaAtivo.usuarios.nome;

              return (
                <div
                  key={msg.id}
                  className={`mb-4 max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    isRemetente
                      ? 'ml-auto bg-green-200 text-right rounded-br-none'
                      : 'bg-white border border-gray-300 rounded-bl-none'
                  }`}
                >
                  <p>{msg.mensagem}</p>
                  <div className="mt-1 text-xs text-gray-500">{nome} · {hora}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-3 py-2"
              placeholder="Escreva algo gentil..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
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
