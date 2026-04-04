import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Colors = {
  primary: '#0A2540',
  accent: '#00BFA6',
  background: '#F5F7FA',
  success: '#22C55E',
  danger: '#EF4444',
  white: '#FFFFFF',
  gray: '#6B7280',
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all active:scale-[0.98]",
      className
    )}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true,
  className,
  ...props 
}) => {
  const variants = {
    primary: "bg-[#0A2540] text-white hover:bg-[#123557]",
    secondary: "bg-[#00BFA6] text-white hover:bg-[#00a691]",
    outline: "bg-transparent border-2 border-[#0A2540] text-[#0A2540]",
    ghost: "bg-transparent text-[#6B7280]",
  };

  return (
    <button
      className={cn(
        "px-6 py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ 
  label, 
  className, 
  ...props 
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-medium text-[#0A2540]/60 ml-1">{label}</label>}
    <input
      className={cn(
        "w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00BFA6]/20 focus:border-[#00BFA6] transition-all",
        className
      )}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'info' }) => {
  const variants = {
    success: "bg-[#22C55E]/10 text-[#22C55E]",
    warning: "bg-yellow-500/10 text-yellow-600",
    danger: "bg-[#EF4444]/10 text-[#EF4444]",
    info: "bg-[#0A2540]/10 text-[#0A2540]",
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider", variants[variant])}>
      {children}
    </span>
  );
};
