import { useEffect, useState } from 'react'
import { supabase } from "../../supabaseClient";

export default function EspecialistaDashboard({ usuario }) {
  const [maes, setMaes] = useState([])
  const [maeSelecionada, setMaeSelecionada] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [gravidez, setGravidez] = useState(null)
  const [novaMensagem, setNovaMensagem] = useState('')

  useEffect(() => {
    async function carregarMaes() {
      const { data } = await supabase
        .from('mae_especialista')
        .select('mae_id, usuarios(nome)')
        .eq('especialista_id', usuario.especialista_id)

      setMaes(data || [])
    }

    carregarMaes()
  }, [])

  const carregarChatEMedica = async maeId => {
    setMaeSelecionada(maeId)

    const { data: msgs } = await supabase
      .from('mensagens_chat')
      .select('*')
      .or(`remetente_id.eq.${maeId},destinatario_id.eq.${maeId}`)
      .order('enviada_em')

    setMensagens(
      msgs.filter(
        m =>
          (m.remetente_id === maeId && m.destinatario_id === usuario.id) ||
          (m.destinatario_id === maeId && m.remetente_id === usuario.id)
      )
    )

    const { data: gravidez } = await supabase
      .from('gravidez')
      .select('*')
      .eq('mae_id', maeId)
      .order('atualizada_em', { ascending: false })
      .limit(1)
      .single()

    setGravidez(gravidez)
  }

  const enviarResposta = async () => {
    if (!novaMensagem || !maeSelecionada) return
    await supabase.from('mensagens_chat').insert({
      remetente_id: usuario.id,
      destinatario_id: maeSelecionada,
      mensagem: novaMensagem
    })
    setNovaMensagem('')
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Minhas pacientes</h2>
        {maes.map(m => (
          <button
            key={m.mae_id}
            className="block border-b p-2 w-full text-left hover:bg-gray-100"
            onClick={() => carregarChatEMedica(m.mae_id)}
          >
            {m.usuarios?.nome || 'Usuária'}
          </button>
        ))}
      </div>

      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-2">Chat com a mãe</h3>
        <div className="bg-gray-100 h-64 overflow-y-auto p-3 mb-3 rounded">
          {mensagens.map(msg => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-md max-w-[70%] ${
                msg.remetente_id === usuario.id
                  ? 'bg-green-200 ml-auto text-right'
                  : 'bg-blue-100'
              }`}
            >
              {msg.mensagem}
            </div>
          ))}
        </div>
        <div className="flex mb-4">
          <input
            className="flex-1 border p-2 rounded-l"
            placeholder="Responder..."
            value={novaMensagem}
            onChange={e => setNovaMensagem(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 rounded-r"
            onClick={enviarResposta}
          >
            Enviar
          </button>
        </div>

        {gravidez && (
          <div className="bg-white shadow rounded p-4">
            <h4 className="font-bold mb-2">Dados da Gravidez</h4>
            <p><strong>Semanas:</strong> {gravidez.semanas_gestacao}</p>
            <p><strong>Peso:</strong> {gravidez.peso} kg</p>
            <p><strong>Pressão:</strong> {gravidez.pressao_arterial}</p>
            <p><strong>Sintomas:</strong> {gravidez.sintomas}</p>
            <p><strong>Exames:</strong> {gravidez.exames_recentes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
