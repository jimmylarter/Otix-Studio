import { cn } from "@/lib/cn";
import { Select } from "@/components/Select";

export type InputKind = "text" | "email" | "select" | "textarea";

export interface InputOption {
  value: string;
  label: string;
}

export interface InputProps {
  name: string;
  /** visually-hidden label for a11y; falls back to placeholder */
  label?: string;
  placeholder?: string;
  kind?: InputKind;
  options?: InputOption[];
  error?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
}

const fieldBase =
  "w-full rounded-sm border bg-surface-white px-base text-body text-text-on-light shadow-sunken outline-none transition-shadow duration-base ease-standard placeholder:text-text-on-light/30 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Form field. text / email / select / textarea, with focus (teal glow),
 * error, and disabled states. Pure presentation; state lives in the form.
 */
export function Input({
  name,
  label,
  placeholder,
  kind = "text",
  options = [],
  error,
  required,
  disabled,
  defaultValue,
  className,
}: InputProps) {
  const hasError = !!error;
  const stateCls = hasError
    ? "border-error focus:shadow-focus-error"
    : "border-border-on-light focus:border-primary-blue focus:shadow-focus";

  const commonProps = {
    id: name,
    name,
    required,
    disabled,
    "aria-invalid": hasError || undefined,
    "aria-label": label ?? placeholder,
  };

  let field: React.ReactNode;
  if (kind === "textarea") {
    field = (
      <textarea
        {...commonProps}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(fieldBase, "min-h-field-lg py-base", stateCls)}
      />
    );
  } else if (kind === "select") {
    field = (
      <Select
        name={name}
        label={label}
        placeholder={placeholder}
        options={options}
        defaultValue={defaultValue}
        error={hasError}
        disabled={disabled}
      />
    );
  } else {
    field = (
      <input
        {...commonProps}
        type={kind}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={cn(fieldBase, "h-field", stateCls)}
      />
    );
  }

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      {field}
      {typeof error === "string" && <span className="text-body-sm text-error">{error}</span>}
    </div>
  );
}

export default Input;
