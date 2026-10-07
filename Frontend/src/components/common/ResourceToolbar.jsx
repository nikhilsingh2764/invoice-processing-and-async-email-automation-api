import { Search } from 'lucide-react';

export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
    </div>
  );
}
