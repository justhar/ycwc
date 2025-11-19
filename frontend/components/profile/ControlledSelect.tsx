/**
 * Controlled Select Component with debounced updates
 * Extracted from profile page for reusability
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "lodash";

interface ControlledSelectProps {
  value?: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export function ControlledSelect({
  value: initialValue = "",
  onUpdate,
  placeholder,
  children,
  className,
}: ControlledSelectProps) {
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
    (newValue: string) => {
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
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {children}
    </Select>
  );
}
