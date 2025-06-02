export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-2 py-2 ${className}`}>{children}</div>;
}
