import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function PerfilEspecialista({ especialistaId }) {
  const [perfil, setPerfil] = useState(null);
  const [editando, setEditando] = useState(false);
  const [novaBiografia, setNovaBiografia] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!especialistaId) return;
      const { data, error } = await supabase
        .from('especialistas')
        .select('*')
        .eq('id', especialistaId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }
      setPerfil(data);
      setNovaBiografia(data?.biografia || '');
    };

    fetchPerfil();
  }, [especialistaId]);

  const handleEditar = () => {
    setEditando(true);
  };

  const handleSalvar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('especialistas')
      .update({ biografia: novaBiografia })
      .eq('id', especialistaId);

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMensagem('Erro ao atualizar perfil.');
    } else {
      setMensagem('Perfil atualizado com sucesso!');
      setPerfil({ ...perfil, biografia: novaBiografia });
      setEditando(false);
    }
    setLoading(false);
  };

  if (!perfil) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Perfil do Especialista</h2>
      {editando ? (
        <>
          <textarea
            value={novaBiografia}
            onChange={(e) => setNovaBiografia(e.target.value)}
            className="w-full border rounded-md p-2 mb-2"
            rows="4"
            placeholder="Biografia..."
          />
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          {mensagem && <p className="text-sm text-green-600">{mensagem}</p>}
        </>
      ) : (
        <>
          {perfil.biografia ? (
            <p>{perfil.biografia}</p>
          ) : (
            <p>Adicione uma biografia.</p>
          )}
          <button
            onClick={handleEditar}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mt-2"
          >
            Editar
          </button>
        </>
      )}
    </div>
  );
}

export default PerfilEspecialista;