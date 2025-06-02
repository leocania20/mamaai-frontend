export function Input({ type = "text", value, onChange, id, placeholder, className = "" }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 ${className}`}
    />
  );
}
