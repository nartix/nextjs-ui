import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

interface CSRFInputProps {
  setValue: (name: string, value: string) => void;
  CSRFToken?: string;
}

export function HiddenCSRFTokenInput({ setValue, CSRFToken }: CSRFInputProps) {
  useEffect(() => {
    if (CSRFToken) {
      setValue('csrf_token', CSRFToken);
    }
  }, [CSRFToken, setValue]);

  return (
    <Controller
      name='csrf_token'
      defaultValue={CSRFToken}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <input type='hidden' value={value} ref={ref} onChange={onChange} onBlur={onBlur} />
      )}
    />
  );
}
