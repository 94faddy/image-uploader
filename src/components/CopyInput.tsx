'use client'

import { toast } from 'sonner'

interface CopyInputProps {
  value: string
  className?: string
}

export default function CopyInput({ value, className = '' }: CopyInputProps) {
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement
    input.select()
  }

  const handleDoubleClick = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <input
      type="text"
      readOnly
      value={value}
      className={className}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    />
  )
}