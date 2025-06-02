import { useEffect, useState } from "react";
import { supabase } from "../../src/supabaseClient";

export default function DadosPaisForm() {
  const [dados, setDados] = useState(null);
  const [fotoPaiPreview, setFotoPaiPreview] = useState(null);
  const [fotoMaePreview, setFotoMaePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuarioId(user.id);
      const { data } = await supabase
        .from("pais")
        .select("*")
        .eq("id_mae", user.id)
        .single();
      setDados(data || {});
    }
    carregar();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const uploadImagem = async (file, tipo) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${usuarioId}_${tipo}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("fotospais")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error("Erro ao fazer upload:", error);
    alert("Erro ao fazer upload da imagem");
    return null;
  }

  return supabase.storage.from("fotospais").getPublicUrl(fileName).data.publicUrl;
};


  const handleFoto = async (e, tipo) => {
    const file = e.target.files[0];
    const url = await uploadImagem(file, tipo);
    if (url) {
      setDados((prev) => ({ ...prev, [`foto_${tipo}`]: url }));
      if (tipo === "pai") setFotoPaiPreview(url);
      else setFotoMaePreview(url);
    }
  };

  const salvar = async () => {
    setLoading(true);
    const payload = { ...dados, id_mae: usuarioId };

    if (dados?.id) {
      await supabase.from("pais").update(payload).eq("id", dados.id);
    } else {
      const { data } = await supabase.from("pais").insert(payload).select().single();
      setDados(data);
    }
    setLoading(false);
    alert("Dados salvos com sucesso!");
  };

  const eliminar = async () => {
    if (!dados?.id) return;
    const confirmar = confirm("Deseja realmente eliminar os dados dos pais?");
    if (confirmar) {
      await supabase.from("pais").delete().eq("id", dados.id);
      setDados({});
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-pink-600 mb-4">🧬 Dados dos Pais</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Nome do Pai</label>
          <input type="text" name="nome_pai" value={dados?.nome_pai || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Nome da Mãe</label>
          <input type="text" name="nome_mae" value={dados?.nome_mae || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Cor da Pele do Pai</label>
          <input type="text" name="cor_pele_pai" value={dados?.cor_pele_pai || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Cor da Pele da Mãe</label>
          <input type="text" name="cor_pele_mae" value={dados?.cor_pele_mae || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Raça do Pai</label>
          <input type="text" name="raca_pai" value={dados?.raca_pai || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Raça da Mãe</label>
          <input type="text" name="raca_mae" value={dados?.raca_mae || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Descendência do Pai</label>
          <input type="text" name="descendencia_pai" value={dados?.descendencia_pai || ""} onChange={handleChange} className="input" />
        </div>
        <div>
          <label>Descendência da Mãe</label>
          <input type="text" name="descendencia_mae" value={dados?.descendencia_mae || ""} onChange={handleChange} className="input" />
        </div>

        <div>
          <label>Foto do Pai</label>
          <input type="file" accept="image/*" onChange={(e) => handleFoto(e, "pai")} />
          {dados?.foto_pai && <img src={dados.foto_pai} alt="Foto do Pai" className="w-24 mt-2 rounded" />}
        </div>
        <div>
          <label>Foto da Mãe</label>
          <input type="file" accept="image/*" onChange={(e) => handleFoto(e, "mae")} />
          {dados?.foto_mae && <img src={dados.foto_mae} alt="Foto da Mãe" className="w-24 mt-2 rounded" />}
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={salvar} disabled={loading} className="bg-pink-600 text-white px-4 py-2 rounded">
          {dados?.id ? "Atualizar" : "Salvar"}
        </button>
        {dados?.id && (
          <button onClick={eliminar} className="bg-red-600 text-white px-4 py-2 rounded">Eliminar</button>
        )}
      </div>
    </div>
  );
}
