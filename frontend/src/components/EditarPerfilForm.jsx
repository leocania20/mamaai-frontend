import { useEffect, useState } from "react";
import { supabase } from "../../src/supabaseClient";

export default function EditarPerfilForm() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) setUsuario(data);
        else console.error("Erro ao carregar dados:", error);
      }
    }

    carregarDados();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nome, email, senha, data_nascimento, id } = usuario;

    const { error } = await supabase
      .from("usuarios")
      .update({
        nome,
        email,
        senha, // cuidado: considere usar hash depois!
        data_nascimento,
        atualizado_em: new Date(),
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar perfil!");
      console.error(error);
    } else {
      alert("Perfil atualizado com sucesso!");
    }
  };

  return usuario && (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow max-w-md mx-auto"
    >
      <h2 className="text-lg font-bold text-pink-600">✏️ Editar Perfil</h2>

      <input
        type="text"
        value={usuario.nome || ""}
        onChange={e => setUsuario({ ...usuario, nome: e.target.value })}
        className="w-full border rounded p-2"
        placeholder="Nome completo"
        required
      />

      <input
        type="email"
        value={usuario.email || ""}
        onChange={e => setUsuario({ ...usuario, email: e.target.value })}
        className="w-full border rounded p-2"
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={usuario.senha || ""}
        onChange={e => setUsuario({ ...usuario, senha: e.target.value })}
        className="w-full border rounded p-2"
        placeholder="Senha"
        required
      />

      <input
        type="date"
        value={usuario.data_nascimento || ""}
        onChange={e => setUsuario({ ...usuario, data_nascimento: e.target.value })}
        className="w-full border rounded p-2"
        required
      />

      <button
        type="submit"
        className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
      >
        💾 Salvar Alterações
      </button>
    </form>
  );
}
