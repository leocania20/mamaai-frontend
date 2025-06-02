import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarMenu from "../components/SidebarMenu";
import EditarPerfilForm from "../components/EditarPerfilForm";
import DadosPaisForm from "../components/DadosPaisForm";
import GravidezForm from "../components/GravidezForm";

export default function PerfilPage() {
  const [secaoAtiva, setSecaoAtiva] = useState("perfil");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menu lateral deslizante */}
      <SidebarMenu secaoAtiva={secaoAtiva} setSecaoAtiva={setSecaoAtiva} />

      {/* Conteúdo principal */}
      <div className="flex-1 p-8 transition-all duration-500 ease-in-out">
        {secaoAtiva === "perfil" && <EditarPerfilForm />}
        {secaoAtiva === "pais" && <DadosPaisForm />}
        {secaoAtiva === "gravidez" && <GravidezForm />}
      </div>
    </div>
  );
}
