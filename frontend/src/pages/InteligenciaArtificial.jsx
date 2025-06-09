import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "/src/supabaseClient";
import Header from "../components/Header";
import { FaRobot, FaPaperPlane, FaTrash, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { motion } from "framer-motion";

// Dicionário multilíngue expandido
const translationDict = {
  kmb: {
    "kuzala": "gravidez",
    "mwana": "bebê",
    "kudya": "comida",
    "mujinga": "saúde",
    "kuzala mwa": "amamentação",
    "vaksinas": "vacinas",
    "mambu": "mitos",
    "kudisangula": "emoções",
    "kuzala kwenda": "pré-natal",
    "kuzala kweji": "engravidar",
    "manyoka": "mandioca",
    "kixima kampungumpungu": "chá kampungumpungu",
    "kudika": "sono",
    "kuzala kwele": "exercícios",
    "kibanda": "comunidade",
  },
  umb: {
    "okuzala": "gravidez",
    "omwana": "bebê",
    "okulya": "comida",
    "epangelo": "saúde",
    "okuzala omwana": "amamentação",
    "ovaksinas": "vacinas",
    "omambo": "mitos",
    "okulikalela": "emoções",
    "okuzala kwele": "pré-natal",
    "okuzala okuve": "engravidar",
    "omanyoka": "mandioca",
    "etila kampungumpungu": "chá kampungumpungu",
    "okulala": "sono",
    "okuzala okuvele": "exercícios",
    "etunda": "comunidade",
  },
};

// Cache local para respostas
const responseCache = new Map();

// Stop words para ignorar na busca
const stopWords = ["o", "a", "os", "as", "de", "para", "com", "em", "que", "e", "ou", "na"];

export default function InteligenciaArtificial() {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("pt");

  // Verificar autenticação
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

  // Função para traduzir entrada
  const translateInput = (input, lang) => {
    if (lang === "pt") return input.toLowerCase();
    const dict = translationDict[lang] || {};
    let translated = input.toLowerCase();
    Object.keys(dict).forEach(key => {
      translated = translated.replace(new RegExp(`\\b${key}\\b`, "g"), dict[key]);
    });
    return translated;
  };

  // Função para processar entrada e remover stop words
  const processInput = (input) => {
    return input
      .split(" ")
      .filter(word => !stopWords.includes(word.toLowerCase()) && word.length > 3)
      .join(" ");
  };

  // Função para registrar perguntas não respondidas
  const logUnansweredQuestion = async (question, lang) => {
    try {
      const { error } = await supabase
        .from("unanswered_questions")
        .insert({ question, language: lang });
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao registrar pergunta não respondida:", err);
    }
  };

  // Função para buscar resposta no Supabase
  const fetchResponse = async (input) => {
    try {
      const translatedInput = translateInput(input, language);
      const processedInput = processInput(translatedInput);
      const cacheKey = `${language}:${processedInput}`;

      // Verificar cache
      if (responseCache.has(cacheKey)) {
        return responseCache.get(cacheKey);
      }

      const { data, error } = await supabase
        .rpc("search_knowledge_base", { query_text: processedInput });

      if (error) throw error;

      let result;
      if (data.length > 0) {
        result = { id: data[0].id, response: data[0].response };
      } else {
        await logUnansweredQuestion(input, language);
        result = {
          id: null,
          response: "Desculpe, não encontrei uma resposta. Sua pergunta foi registrada para melhoria futura. Tente reformular ou pergunte sobre gravidez, maternidade ou cultura angolana."
        };
      }

      // Armazenar no cache
      responseCache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.error("Erro ao buscar resposta:", err);
      return { id: null, response: "Ocorreu um erro ao processar sua pergunta. Tente novamente." };
    }
  };

  // Função para enviar feedback
  const submitFeedback = async (responseId, isHelpful) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .insert({ question: chatHistory[chatHistory.length - 1].user, response_id: responseId, is_helpful: isHelpful });

      if (error) throw error;
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      setError("Falha ao enviar feedback. Tente novamente.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);

    const { id, response } = await fetchResponse(userInput);
    const timestamp = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

    setChatHistory([...chatHistory, { user: userInput, ai: response, responseId: id, timestamp }]);
    setUserInput("");
    setIsLoading(false);
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <Header />
      <main className="px-6 py-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <FaRobot className="text-blue-500 text-6xl mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800">Assistente de Maternidade</h2>
          <p className="text-gray-600 mt-2">
            Pergunte sobre gravidez, maternidade ou tradições angolanas em Português, Kimbundu ou Umbundu.
          </p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded-lg"
          >
            <option value="pt">Português</option>
            <option value="kmb">Kimbundu</option>
            <option value="umb">Umbundu</option>
          </select>
        </motion.div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {chatHistory.length === 0 && (
              <p className="text-gray-500 text-center">Nenhuma mensagem ainda. Comece perguntando!</p>
            )}
            {chatHistory.map((chat, index) => (
              <div key={index} className="mb-4">
                <p className="text-sm font-semibold text-gray-800 flex justify-between">
                  <span>Você:</span>
                  <span className="text-gray-500 text-xs">{chat.timestamp}</span>
                </p>
                <p className="text-gray-700">{chat.user}</p>
                <p className="text-sm font-semibold text-gray-800 mt-2 flex justify-between">
                  <span>Assistente:</span>
                  <span className="text-gray-500 text-xs">{chat.timestamp}</span>
                </p>
                <p className="text-gray-700">{chat.ai}</p>
                {chat.responseId && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => submitFeedback(chat.responseId, true)}
                      className="text-green-500 hover:text-green-700"
                      title="Resposta útil"
                    >
                      <FaThumbsUp />
                    </button>
                    <button
                      onClick={() => submitFeedback(chat.responseId, false)}
                      className="text-red-500 hover:text-red-700"
                      title="Resposta não útil"
                    >
                      <FaThumbsDown />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <p className="text-gray-500 text-center">Carregando resposta...</p>
            )}
            {error && (
              <p className="text-red-500 text-center">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Pergunte sobre gravidez, maternidade ou Angola..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isLoading}
              >
                <FaPaperPlane />
              </button>
            </form>
            <button
              onClick={clearChat}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              title="Limpar conversa"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-800"
        >
          Voltar ao Dashboard
        </button>
      </main>
    </div>
  );
}