import { useEffect, useState } from 'react'
import { supabase } from "../../src/supabaseClient";

export default function ChatEspecialista({ userId, destinatarioId }) {
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')

  const carregarMensagens = async () => {
    const { data, error } = await supabase
      .from('mensagens_chat')
      .select('*')
      .or(`remetente_id.eq.${userId},destinatario_id.eq.${userId}`)
      .order('enviada_em', { ascending: true })

    if (!error) setMensagens(data)
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return
    await supabase.from('mensagens_chat').insert({
      remetente_id: userId,
      destinatario_id: destinatarioId,
      mensagem: novaMensagem
    })
    setNovaMensagem('')
  }

  useEffect(() => {
    carregarMensagens()

    const canal = supabase
      .channel('chat_mensagens')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_chat' },
        () => carregarMensagens()
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow-md rounded">
      <div className="h-96 overflow-y-scroll border p-2 mb-4">
        {mensagens.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-md text-sm ${
              msg.remetente_id === userId
                ? 'bg-green-200 text-right'
                : 'bg-blue-100 text-left'
            }`}
          >
            {msg.mensagem}
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-1 border p-2 rounded-l-md"
          value={novaMensagem}
          onChange={e => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem"
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r-md"
          onClick={enviarMensagem}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
