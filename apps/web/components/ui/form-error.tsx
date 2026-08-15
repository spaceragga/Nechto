type FormErrorProps = {
  children: string;
};

export function FormError({ children }: FormErrorProps) {
  return (
    <p className="text-sm text-[var(--error)]" role="alert">
      {children}
    </p>
  );
}
