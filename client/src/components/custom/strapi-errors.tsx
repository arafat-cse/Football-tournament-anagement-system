interface StrapiErrorsProps {
  message: string | null;
  name: string;
  status: string | null;
}

export function StrapiErrors({ error }: { readonly error?: unknown }) {
  const strapiError = error && typeof error === "object" ? (error as Partial<StrapiErrorsProps>) : null;
  if (!strapiError?.message) return null;
  return <div className="text-pink-500 text-md italic py-2">{strapiError.message}</div>;
}
