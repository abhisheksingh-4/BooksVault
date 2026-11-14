export default function FormField({ label, error, helperText, required = false, className = "", as = "input", options, ...props }) {
  const Tag = as;
  const labelIncludesRequired = typeof label === "string" && label.trimEnd().endsWith("*");
  const isRequired = required || labelIncludesRequired;
  const visibleLabel = labelIncludesRequired ? label.trim().slice(0, -1).trimEnd() : label;
  const inputId = props.id || props.name;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy = [helperText && descriptionId, error && errorId].filter(Boolean).join(" ") || undefined;
  const inputProps = {
    ...props,
    id: inputId,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
    required: isRequired,
  };
  return (
    <div className={className}>
      <label className="label" htmlFor={inputId}>
        {visibleLabel}{isRequired && <span className="ml-1 text-error" aria-hidden="true">*</span>}
      </label>
      {as === "select" ? (
        <select className={`field ${error ? "!border-error" : ""}`} {...inputProps}>
          {options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : (
        <Tag className={`field ${error ? "!border-error" : ""}`} {...inputProps} />
      )}
      {helperText && <p id={descriptionId} className="mt-1.5 text-xs leading-5 text-muted">{helperText}</p>}
      {error && <p id={errorId} className="mt-1.5 text-xs text-error" role="alert">{error}</p>}
    </div>
  );
}
