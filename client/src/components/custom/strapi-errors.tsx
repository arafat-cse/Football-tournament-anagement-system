interface StrapiErrorsProps {
  message?: string | null;
  name?: string;
  status?: string | number | null;
}

export function StrapiErrors( { error }: { readonly error?: StrapiErrorsProps | null }) {
  if (!error?.message) return null;
  return <div className="text-pink-500 text-md italic py-2">{error.message}</div>;
}
