import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    data_nascimento: "",
    tipo_utilizador: "",
  });

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: "", texto: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ tipo: "", texto: "" });
    setLoading(true);

    const { email, password, nome, data_nascimento, tipo_utilizador } = form;

    if (!email || !password || (!isLogin && (!nome || !data_nascimento || !tipo_utilizador))) {
      setMsg({ tipo: "erro", texto: "Preencha todos os campos obrigatórios." });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

        if (loginError) {
          throw new Error(loginError.message);
        }

        const { data: userInfo, error: userError } = await supabase
          .from("usuarios")
          .select("tipo_usuario")
          .eq("email", email)
          .single();

        if (userError) {
          throw new Error("Não foi possível recuperar os dados do utilizador.");
        }

        const tipo = userInfo.tipo_usuario;
        if (tipo === "mae") navigate("/dashboard/mae");
        else if (tipo === "especialista") navigate("/dashboard/especialista");
        else if (tipo === "admin") navigate("/dashboard/admin");
        else navigate("/");
        setMsg({ tipo: "sucesso", texto: "Login realizado com sucesso!" });
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        const userId = data.user?.id;
        if (!userId) {
          throw new Error("Não foi possível obter o ID do utilizador.");
        }

        const { error: insertUserError } = await supabase
          .from("usuarios")
          .insert([
            {
              id: userId,
              nome,
              email,
              senha: password, // TODO: Hash password in production
              data_nascimento,
              tipo_usuario: tipo_utilizador.toLowerCase(),
            },
          ]);

        if (insertUserError) {
          throw new Error(insertUserError.message);
        }

        if (tipo_utilizador.toLowerCase() === "especialista") {
          const { error: insertEspecialistaError } = await supabase
            .from("especialistas")
            .insert([
              {
                usuario_id: userId,
                area_especializacao: "", // Add form field for this
                biografia: "", // Add form field for this
                aprovado: false,
              },
            ]);

          if (insertEspecialistaError) {
            console.error("Erro ao criar registro de especialista:", insertEspecialistaError);
            throw new Error("Erro ao criar o registro de especialista.");
          }
        }

        setMsg({
          tipo: "sucesso",
          texto: "Cadastro realizado com sucesso! Verifique seu e-mail.",
        });
      }
    } catch (error) {
      setMsg({ tipo: "erro", texto: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100 p-6">
      <div
        className="relative w-full max-w-xl rounded-xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: "url('/pragment.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black/10 p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <img src="/mamaai-logo.png" alt="MamaAI" className="h-20 w-50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full bg-white/10 border-b border-white text-white placeholder-white focus:outline-none focus:border-blue-300 focus:bg-transparent focus:text-white transition-colors duration-300"
                />
                <input
                  type="date"
                  name="data_nascimento"
                  value={form.data_nascimento}
                  onChange={handleChange}
                  className="w-full bg-white/10 border-b border-white text-white focus:outline-none focus:border-blue-300 focus:bg-transparent focus:text-white transition-colors duration-300"
                />
                <select
                  name="tipo_utilizador"
                  value={form.tipo_utilizador}
                  onChange={handleChange}
                  className="w-full bg-white/10 border-b border-white text-white placeholder-white focus:outline-none focus:border-blue-300 focus:bg-white focus:text-black transition-colors duration-300"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="mae">Mãe</option>
                  <option value="especialista">Especialista</option>
                </select>
              </>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/10 border-b border-white text-white placeholder-white focus:outline-none focus:border-blue-300 focus:bg-transparent focus:text-white transition-colors duration-300"
            />

            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/10 border-b border-white text-white placeholder-white focus:outline-none focus:border-blue-300 focus:bg-transparent focus:text-white transition-colors duration-300"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-400 hover:bg-blue-600 text-white py-2 rounded transition"
            >
              {loading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
            </button>
          </form>

          {msg.texto && (
            <p
              className={`mt-4 text-center ${
                msg.tipo === "erro" ? "text-red-400" : "text-green-300"
              }`}
            >
              {msg.texto}
            </p>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMsg({ tipo: "", texto: "" });
              }}
              className="text-white hover:underline text-sm"
            >
              {isLogin ? "Não tem conta? Cadastrar-se" : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}