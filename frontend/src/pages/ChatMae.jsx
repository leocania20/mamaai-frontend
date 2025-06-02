import { useEffect, useState } from 'react'
import { supabase } from "../supabaseClient";

export default function ChatMae({ usuario }) {
  const [especialista, setEspecialista] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [especialistas, setEspecialistas] = useState([])

  // Ver se a mãe já escolheu especialista
  useEffect(() => {
  if (!usuario || !usuario.id) return;

  async function fetchEspecialista() {
    const { data } = await supabase
      .from('mae_especialista')
      .select('especialista_id, especialistas(usuario_id, usuarios(nome))')
      .eq('mae_id', usuario.id)
      .single();

    if (data) setEspecialista(data.especialistas);
  }

  fetchEspecialista();
}, [usuario]);

  // Listar especialistas para escolher
  useEffect(() => {
    async function listar() {
      const { data } = await supabase
        .from('especialistas')
        .select('id, area_especializacao, usuario_id, usuarios(nome)')
        .eq('aprovado', true)

      setEspecialistas(data || [])
    }
    listar()
  }, [])

  // Enviar mensagem
  const enviar = async () => {
    if (!novaMensagem.trim() || !especialista) return
    await supabase.from('mensagens_chat').insert({
      remetente_id: usuario.id,
      destinatario_id: especialista.usuario_id,
      mensagem: novaMensagem
    })
    setNovaMensagem('')
  }

  // Carregar mensagens
  useEffect(() => {
    if (!especialista) return
    async function carregarMensagens() {
      const { data } = await supabase
        .from('mensagens_chat')
        .select('*')
        .or(`remetente_id.eq.${usuario.id},destinatario_id.eq.${usuario.id}`)
        .order('enviada_em')

      const filtradas = data.filter(m =>
        [m.remetente_id, m.destinatario_id].includes(especialista.usuario_id)
      )

      setMensagens(filtradas)
    }

    carregarMensagens()

    const canal = supabase
      .channel('chat_mensagens')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_chat' },
        carregarMensagens
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [especialista])

  // Selecionar especialista
  const selecionar = async e => {
    const idSelecionado = e.target.value
    const especialistaEscolhido = especialistas.find(e => e.id === idSelecionado)

    await supabase.from('mae_especialista').insert({
      mae_id: usuario.id,
      especialista_id: idSelecionado
    })

    setEspecialista(especialistaEscolhido)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 rounded shadow mt-8">
      <h1 className="text-xl font-semibold mb-4">Chat com Especialista</h1>

      {!especialista ? (
        <>
          <label className="block mb-2">Escolha seu especialista:</label>
          <select
            className="w-full border p-2 rounded"
            onChange={selecionar}
            defaultValue=""
          >
            <option value="" disabled>Selecione</option>
            {especialistas.map(e => (
              <option key={e.id} value={e.id}>
                {e.usuarios.nome} – {e.area_especializacao}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <div className="h-80 overflow-y-auto bg-gray-100 p-3 rounded mb-4">
            {mensagens.map(m => (
              <div
                key={m.id}
                className={`mb-2 p-2 rounded-md max-w-[70%] ${
                  m.remetente_id === usuario.id
                    ? 'bg-green-200 ml-auto text-right'
                    : 'bg-blue-100'
                }`}
              >
                {m.mensagem}
              </div>
            ))}
          </div>

          <div className="flex">
            <input
              className="flex-1 border p-2 rounded-l"
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={e => setNovaMensagem(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={enviar}
            >
              Enviar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
