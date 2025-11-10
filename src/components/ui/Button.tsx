// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  disabled, 
  loading, 
  variant = 'primary',
  className = ""
}: ButtonProps) {
  const baseClasses = "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white/10 border border-white/20 hover:bg-white/20 text-white backdrop-blur-sm",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}