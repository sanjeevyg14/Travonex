import React, { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, length = 6 }) => {
  const refs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) return;
    const chars = value.split('');
    chars[index] = numeric;
    const newVal = chars.join('').slice(0, length);
    onChange(newVal);
    if (numeric && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => {
            if (el) refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-10 h-10 text-center border rounded"
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(e, i)}
        />
      ))}
    </div>
  );
};

export default OtpInput;
