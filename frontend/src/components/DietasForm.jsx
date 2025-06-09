import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function DietasForm({ maeId, especialistaId }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maeId || !especialistaId || !titulo || !descricao || !dataInicio || !dataFim) {
      setMensagem('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dietas')
        .insert([
          {
            mae_id: maeId,
            titulo,
            descricao,
            data_inicio: dataInicio,
            data_fim: dataFim,
          },
        ]);

      if (error) {
        console.error('Erro ao criar dieta:', error);
        setMensagem('Erro ao criar dieta.');
      } else {
        setMensagem('Dieta atribuída com sucesso!');
        setTitulo('');
        setDescricao('');
        setDataInicio('');
        setDataFim('');
      }
    } catch (error) {
      console.error('Erro ao criar dieta:', error);
      setMensagem('Erro ao criar dieta.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">Data de Início</label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">Data de Fim</label>
          <input
            type="date"
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Atribuir Dieta
      </button>
      {mensagem && <p className="text-sm text-green-600">{mensagem}</p>}
    </form>
  );
}

export default DietasForm;