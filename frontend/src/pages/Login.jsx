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

    if (isLogin) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        setMsg({ tipo: "erro", texto: loginError.message });
      } else {
        const { data: userInfo, error: userError } = await supabase
          .from("usuarios")
          .select("tipo_usuario")
          .eq("email", email)
          .single();

        if (userError) {
          setMsg({ tipo: "erro", texto: "Não foi possível recuperar os dados do utilizador." });
        } else {
          const tipo = userInfo.tipo_usuario;
          if (tipo === "mae") navigate("/dashboard/mae");
          else if (tipo === "especialista") navigate("/dashboard/especialista");
          else if (tipo === "admin") navigate("/admin");
          else navigate("/");
          setMsg({ tipo: "sucesso", texto: "Login realizado com sucesso!" });
        }
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setMsg({ tipo: "erro", texto: signUpError.message });
      } else {
        const userId = data.user?.id;

        if (!userId) {
          setMsg({ tipo: "erro", texto: "Não foi possível obter o ID do utilizador." });
          setLoading(false);
          return;
        }

        const { error: insertError } = await supabase
          .from("usuarios")
          .insert([
            {
              id: userId,
              nome,
              email,
              senha: password, // Opcional: encriptar com bcrypt
              data_nascimento,
              tipo_usuario: tipo_utilizador.toLowerCase(),
            },
          ]);

        if (insertError) {
          setMsg({ tipo: "erro", texto: insertError.message });
        } else {
          setMsg({
            tipo: "sucesso",
            texto: "Cadastro realizado com sucesso! Verifique seu e-mail.",
          });
        }
      }
    }

    setLoading(false);
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
                  {/* Você pode adicionar mais tipos aqui, como especialista ou admin */}
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
