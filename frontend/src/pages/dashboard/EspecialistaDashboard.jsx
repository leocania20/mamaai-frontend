import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ChatBox from '../../components/ChatBox';
import DietasForm from '../../components/DietasForm';
import PerfilEspecialista from '../../components/PerfilEspecialista';
import DadosMae from '../../components/DadosMae';
import Header from "../../components/Header";

function EspecialistaDashboard() {
  const [maesComChat, setMaesComChat] = useState([]);
  const [selectedMaeId, setSelectedMaeId] = useState(null);
  const [especialistaId, setEspecialistaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEspecialistaId = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session?.user) {
          console.error('Erro ao obter sessão ou usuário não autenticado:', sessionError);
          setError('Usuário não autenticado. Por favor, faça login novamente.');
          navigate('/login');
          return;
        }

        const userId = sessionData.session.user.id;
        const { data: usuario, error: userError } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('id', userId)
          .single();

        if (userError || !usuario) {
          console.error('Erro ao buscar tipo de usuário:', userError);
          setError('Não foi possível verificar o tipo de usuário.');
          return;
        }

        if (usuario.tipo_usuario !== 'especialista') {
          setError('Acesso restrito a especialistas.');
          navigate('/dashboard/mae');
          return;
        }

        const { data, error } = await supabase
          .rpc('buscar_especialista_por_usuario', { usuario: userId })
          .single();

        if (error) {
          console.error('Erro ao buscar o ID do especialista:', error);
          if (error.code === 'PGRST116') {
            setError('Nenhum registro de especialista encontrado para este usuário. Contacte o administrador.');
          } else {
            setError('Erro ao buscar informações do especialista.');
          }
          return;
        }

        setEspecialistaId(data ? data.id : null);
      } catch (err) {
        console.error('Erro inesperado ao buscar o ID do especialista:', err);
        setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchEspecialistaId();
  }, [navigate]);

  useEffect(() => {
    if (!especialistaId) return;

    const fetchMaesComChat = async () => {
      try {
        const { data: mensagens, error: mensagensError } = await supabase
          .from('mensagens_chat')
          .select('remetente_id, destinatario_id, usuarios!mensagens_chat_remetente_id_fkey (nome, id), usuarios!mensagens_chat_destinatario_id_fkey (nome, id)')
          .or(`remetente_id.eq.${especialistaId},destinatario_id.eq.${especialistaId}`)
          .order('enviada_em', { ascending: false });

        if (mensagensError) {
          console.error('Erro ao buscar mensagens:', mensagensError);
          setError('Erro ao carregar as conversas.');
          return;
        }

        const maesUnicas = mensagens.reduce((acc, mensagem) => {
          let mae = null;
          if (mensagem.remetente_id === especialistaId) {
            mae = mensagem.usuarios_1;
          } else {
            mae = mensagem.usuarios;
          }

          if (mae && mae.id && !acc.find(m => m.id === mae.id)) {
            acc.push(mae);
          }
          return acc;
        }, []);

        setMaesComChat(maesUnicas);
      } catch (err) {
        console.error('Erro ao buscar as mães com chat:', err);
        setError('Erro ao carregar a lista de mães.');
      }
    };

    fetchMaesComChat();
  }, [especialistaId]);

  const handleMaeClick = (maeId) => {
    setSelectedMaeId(maeId);
  };

  const renderChat = () => {
    if (selectedMaeId) {
      return <ChatBox maeId={selectedMaeId} especialistaId={especialistaId} />;
    }
    return <p className="text-gray-600">Selecione uma mãe para iniciar o chat.</p>;
  };

  const renderDadosMae = () => {
    if (selectedMaeId) {
      return <DadosMae maeId={selectedMaeId} />;
    }
    return <p className="text-gray-600">Selecione uma mãe para visualizar os dados.</p>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition duration-200"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard do Especialista</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <PerfilEspecialista especialistaId={especialistaId} />
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Mães com Conversas</h2>
              <ul className="space-y-2">
                {maesComChat.map((mae) => (
                  <li
                    key={mae.id}
                    className={`cursor-pointer p-3 rounded-lg hover:bg-gray-100 transition duration-200 ${
                      selectedMaeId === mae.id ? 'bg-pink-100' : ''
                    }`}
                    onClick={() => handleMaeClick(mae.id)}
                  >
                    {mae.nome}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Chat</h2>
              {renderChat()}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Atribuir Dieta</h2>
              <DietasForm maeId={selectedMaeId} especialistaId={especialistaId} />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Dados da Mãe</h2>
              {renderDadosMae()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EspecialistaDashboard;