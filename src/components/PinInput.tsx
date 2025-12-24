import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PinInput({ length = 4, value, onChange, className }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const [showPin, setShowPin] = useState(false);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit.slice(-1);
    const result = newValue.join('').slice(0, length);
    onChange(result);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-3 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            className={cn(
              "w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-card transition-all duration-200",
              focused === index
                ? "border-primary ring-4 ring-primary/20 scale-105"
                : "border-input",
              value[index] ? "border-primary/50 bg-primary/5" : ""
            )}
          />
        ))}
      </div>
      
      {/* Toggle visibility button */}
      <button
        type="button"
        onClick={() => setShowPin(!showPin)}
        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPin ? (
          <>
            <EyeOff className="w-4 h-4" />
            <span>Pincode verbergen</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            <span>Pincode tonen</span>
          </>
        )}
      </button>
    </div>
  );
}
