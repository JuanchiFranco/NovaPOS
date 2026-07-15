import { Search } from 'lucide-react'
import { InputHTMLAttributes } from 'react'

export function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input className="input-base pl-9" {...props} />
    </div>
  )
}
