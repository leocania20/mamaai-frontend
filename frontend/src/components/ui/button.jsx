export function Button({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-xl transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
