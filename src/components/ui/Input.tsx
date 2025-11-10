// components/ui/Input.tsx
export interface InputFormProps {
  label: string;
  placeholder: string;
  value?: string;
  type?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function InputForm({ label, placeholder, value, type = "text", onChange }: InputFormProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/80 font-medium text-sm">{label}</label>
      <input
        className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
      />
    </div>
  );
}