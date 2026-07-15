import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={`card p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
