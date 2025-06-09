import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function MaesEmConversa({ especialistaId }) {
  const [maes, setMaes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!especialistaId) return;

    async function carregarMaes() {
      setLoading(true);
      setError(null);

      try {
        console.log("especialistaId recebido:", especialistaId);

        // Buscar mensagens onde o especialista é remetente ou destinatário
        const { data: mensagens, error: mensagensError } = await supabase
          .from("mensagens_chat")
          .select("remetente_id, destinatario_id")
          .or(
            `remetente_id.eq.${especialistaId},destinatario_id.eq.${especialistaId}`
          );

        if (mensagensError) throw mensagensError;

        const idsUsuarios = new Set();

        mensagens.forEach(({ remetente_id, destinatario_id }) => {
          if (remetente_id !== especialistaId) idsUsuarios.add(remetente_id);
          if (destinatario_id !== especialistaId) idsUsuarios.add(destinatario_id);
        });

        const ids = Array.from(idsUsuarios);

        if (ids.length === 0) {
          setMaes([]);
          return;
        }

        // Buscar os dados das mães
        const { data: maesData, error: maesError } = await supabase
          .from("usuarios")
          .select("id, nome, email")
          .in("id", ids)
          .eq("tipo_usuario", "mae");

        if (maesError) throw maesError;

        setMaes(maesData || []);
      } catch (e) {
        console.error("Erro ao carregar mães:", e);
        setError("Erro ao carregar mães: " + e.message);
      } finally {
        setLoading(false);
      }
    }

    carregarMaes();
  }, [especialistaId]);

  if (loading) return <p>Carregando mães...</p>;
  if (error) return <p>{error}</p>;
  if (maes.length === 0) return <p>Nenhuma mãe em conversa encontrada.</p>;

  return (
    <div>
      <h2>Mães em conversa com você</h2>
      <ul>
        {maes.map((mae) => (
          <li key={mae.id}>
            <strong>{mae.nome}</strong> - {mae.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
