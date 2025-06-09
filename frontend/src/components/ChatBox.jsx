import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function ChatBox({ maeId, especialistaId }) {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState('');

  useEffect(() => {
    if (!maeId || !especialistaId) return;
    const fetchMensagens = async () => {
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('*')
        .or(`remetente_id.eq.${maeId},destinatario_id.eq.${maeId}`)
        .order('enviada_em', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return;
      }
      setMensagens(data);
    };

    fetchMensagens();
  }, [maeId, especialistaId]);

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !maeId || !especialistaId) return;

    const { data, error } = await supabase
      .from('mensagens_chat')
      .insert([
        {
          remetente_id: especialistaId,
          destinatario_id: maeId,
          mensagem: novaMensagem,
        },
      ]);

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      return;
    }

    setMensagens([...mensagens, data[0]]);
    setNovaMensagem('');
  };

  return (
    <div className="h-64 overflow-y-scroll border rounded-md p-2">
      {mensagens.map((mensagem) => (
        <div
          key={mensagem.id}
          className={`mb-2 p-2 rounded-md ${
            mensagem.remetente_id === especialistaId ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
          }`}
        >
          <p>{mensagem.mensagem}</p>
        </div>
      ))}

      <div className="mt-2 flex items-center">
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          className="flex-grow mr-2 border rounded-md p-2"
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={enviarMensagem}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default ChatBox;