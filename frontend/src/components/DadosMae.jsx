import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function DadosMae({ maeId }) {
  const [gravidez, setGravidez] = useState(null);
  const [acompanhamentos, setAcompanhamentos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true); // Adicione o estado de carregamento

  useEffect(() => {
    const fetchDados = async () => {
      if (!maeId) return;

      // Buscar dados do usuário (nome, email, etc.)
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', maeId)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
      }
      setUsuario(userData);

      // Buscar informações da gravidez
      const { data: gravidezData, error: gravidezError } = await supabase
        .from('gravidezes')
        .select('*')
        .eq('id_mae', maeId)
        .single();

      if (gravidezError) {
        console.error('Erro ao buscar dados da gravidez:', gravidezError);
      }
      setGravidez(gravidezData);

      // Buscar acompanhamentos
      const { data: acompanhamentosData, error: acompanhamentosError } = await supabase
        .from('acompanhamentos')
        .select('*')
        .eq('id_mae', maeId)
        .order('created_at', { ascending: false });

      if (acompanhamentosError) {
        console.error('Erro ao buscar acompanhamentos:', acompanhamentosError);
      }
      setAcompanhamentos(acompanhamentosData);
      setLoading(false); // Define como falso após carregar os dados
    };

    fetchDados();
  }, [maeId]);

  if (loading) {
    return <p>Carregando dados da mãe...</p>; // Exibe "Carregando..." enquanto carrega
  }

  if (!maeId) {
    return <p>Selecione uma mãe para ver os dados.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Dados da Mãe</h2>

      {usuario && (
        <div>
          <p>
            **Nome:** {usuario.nome}
          </p>
          <p>
            **Email:** {usuario.email}
          </p>
          {/* Adicione mais dados do usuário aqui */}
        </div>
      )}

      {gravidez && (
        <div>
          <h3 className="font-medium mt-4">Gravidez</h3>
          <p>
            **Data de Início:** {gravidez.data_inicio}
          </p>
          <p>
            **Semanas:** {gravidez.semanas}
          </p>
          {/* Adicione mais dados da gravidez aqui */}
        </div>
      )}

      {acompanhamentos.length > 0 && (
        <div>
          <h3 className="font-medium mt-4">Acompanhamentos</h3>
          <ul>
            {acompanhamentos.map((acompanhamento) => (
              <li key={acompanhamento.id} className="mb-2">
                <p>
                  **Semana:** {acompanhamento.semana}
                </p>
                <p>
                  **Peso:** {acompanhamento.peso}
                </p>
                {/* Adicione mais detalhes do acompanhamento aqui */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default DadosMae;