/**
 * Controlled Textarea Component with debounced updates
 * Extracted from profile page for reusability
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { debounce } from "lodash";

interface ControlledTextareaProps {
  value?: string;
  placeholder?: string;
  onUpdate: (value: string) => void;
  className?: string;
}

export function ControlledTextarea({
  value: initialValue = "",
  placeholder,
  onUpdate,
  className,
}: ControlledTextareaProps) {
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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
