/**
 * Controlled Input Component with debounced updates
 * Extracted from profile page for reusability
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";

interface ControlledInputProps {
  value?: string;
  placeholder?: string;
  type?: string;
  onUpdate: (value: string) => void;
  className?: string;
}

export function ControlledInput({
  value: initialValue = "",
  placeholder,
  type = "text",
  onUpdate,
  className,
}: ControlledInputProps) {
  const [value, setValue] = useState(initialValue);
  const updateRef = useRef<string>(initialValue);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((val: string) => {
      onUpdate(val);
    }, 300),
    [onUpdate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      updateRef.current = newValue;
      debouncedUpdate(newValue);
    },
    [debouncedUpdate]
  );

  // Update local state when external value changes
  useEffect(() => {
    if (initialValue !== updateRef.current) {
      setValue(initialValue);
      updateRef.current = initialValue;
    }
  }, [initialValue]);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      type={type}
      className={className}
    />
  );
}
