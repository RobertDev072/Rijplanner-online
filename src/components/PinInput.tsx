import React, { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check } from 'lucide-react';
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

  const isComplete = value.length === length;

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
        {Array.from({ length }).map((_, index) => {
          const isFilled = !!value[index];
          const isFocused = focused === index;
          
          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                scale: isFocused ? 1.05 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative"
            >
              <input
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
                  "w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 bg-card transition-all duration-200 outline-none",
                  isFocused && "border-primary ring-4 ring-primary/20",
                  isFilled && !isFocused && "border-primary/50 bg-primary/5",
                  !isFilled && !isFocused && "border-input",
                  isComplete && "border-success bg-success/5"
                )}
              />
              
              {/* Filled indicator dot */}
              <AnimatePresence>
                {isFilled && !isComplete && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        
        {/* Checkmark when complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 0, opacity: 0, x: -10 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center justify-center w-14 h-16"
            >
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-md">
                <Check className="w-5 h-5 text-success-foreground stroke-[3]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Toggle visibility button */}
      <motion.button
        type="button"
        onClick={() => setShowPin(!showPin)}
        whileTap={{ scale: 0.95 }}
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
      </motion.button>
    </div>
  );
}
