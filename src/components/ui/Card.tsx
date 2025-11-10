// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function Card({ children, className = "", gradient = false }: CardProps) {
  return (
    <div className={`
      rounded-2xl border border-gray-700 bg-gray-800
      ${gradient 
        ? 'bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20' 
        : 'bg-gray-800'
      }
      shadow-xl
      ${className}
    `}>
      {children}
    </div>
  );
}