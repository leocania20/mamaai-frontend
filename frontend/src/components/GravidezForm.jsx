import { useEffect, useState } from "react";
import { supabase } from "../../src/supabaseClient";

export default function GravidezForm() {
  const [gravidezes, setGravidezes] = useState([]);
  const [formData, setFormData] = useState({
    data_inicio: "",
    semanas: "",
    id_pais: ""
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [gravidezEditando, setGravidezEditando] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [opcoesPais, setOpcoesPais] = useState([]);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuarioId(user.id);

      const { data: gravs } = await supabase
        .from("gravidezes")
        .select("*")
        .eq("id_mae", user.id)
        .order("created_at", { ascending: false });
      setGravidezes(gravs || []);

      const { data: pais } = await supabase
        .from("pais")
        .select("id, nome_pai, nome_mae")
        .eq("id_mae", user.id);
      setOpcoesPais(pais || []);
    }
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const salvar = async () => {
    

    const payload = {
      ...formData,
      semanas: parseInt(formData.semanas),
      id_mae: usuarioId,
    };

    if (modoEdicao && gravidezEditando) {
      await supabase.from("gravidezes").update(payload).eq("id", gravidezEditando);
    } else {
      await supabase.from("gravidezes").insert(payload);
    }

    // Reset
    setFormData({ data_inicio: "", semanas: "", id_pais: "" });
    setModoEdicao(false);
    setGravidezEditando(null);

    // Recarrega
    const { data: atualizadas } = await supabase
      .from("gravidezes")
      .select("*")
      .eq("id_mae", usuarioId)
      .order("created_at", { ascending: false });
    setGravidezes(atualizadas);
  };

  const editar = (gravidez) => {
    setFormData({
      data_inicio: gravidez.data_inicio,
      semanas: gravidez.semanas,
      id_pais: gravidez.id_pais || "",
    });
    setModoEdicao(true);
    setGravidezEditando(gravidez.id);
  };

  const eliminar = async (id) => {
    const confirmar = confirm("Deseja realmente eliminar esta gravidez?");
    if (confirmar) {
      await supabase.from("gravidezes").delete().eq("id", id);
      setGravidezes((prev) => prev.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-pink-600 mb-4">
        🤰 Gravidezes Registradas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label>Data de Início</label>
          <input
            type="date"
            name="data_inicio"
            value={formData.data_inicio}
            onChange={handleChange}
            className="input"
          />
        </div>
       
        <div className="col-span-2">
          <label>Pais Associados</label>
          <select
            name="id_pais"
            value={formData.id_pais}
            onChange={handleChange}
            className="input"
          >
            <option value="">-- Nenhum --</option>
            {opcoesPais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_pai} & {p.nome_mae}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={salvar} className="bg-pink-600 text-white px-4 py-2 rounded">
          {modoEdicao ? "Atualizar" : "Salvar"}
        </button>
        {modoEdicao && (
          <button
            onClick={() => {
              setModoEdicao(false);
              setGravidezEditando(null);
              setFormData({ data_inicio: "", semanas: "", id_pais: "" });
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">📋 Lista de Gravidezes</h3>
        {gravidezes.length === 0 ? (
          <p>Nenhuma gravidez registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {gravidezes.map((g) => (
              <li
                key={g.id}
                className="bg-pink-50 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p><strong>Início:</strong> {g.data_inicio}</p>
                  <p><strong>Semanas:</strong> {g.semanas}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editar(g)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(g.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
