import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Menu, Transition } from "@headlessui/react";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [nome, setNome] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (userId) {
        const { data: usuario, error } = await supabase
          .from("usuarios")
          .select("nome")
          .eq("email", sessionData.session?.user?.email)
          .single();

        if (usuario) setNome(usuario.nome);
        else console.error("Erro ao buscar nome:", error?.message);
      } else {
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-md mb-6">
      <h1 className="text-xl font-semibold text-gray-700">Olá, {nome}</h1>

      {/* Dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex items-center space-x-2 text-pink-600 hover:text-pink-700">
          <FaUserCircle size={32} />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    
                    onClick={ () => navigate("/PerfilPage")}
                    className={`${
                      active ? "bg-pink-100 text-gray-900" : "text-gray-700"
                    } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                  >
                    Editar Perfil
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${
                      active ? "bg-pink-100 text-red-600" : "text-red-500"
                    } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                  >
                    Sair
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </header>
  );
}
