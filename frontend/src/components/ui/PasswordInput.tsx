import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { IconButton } from './IconButton'
import { Input, type InputProps } from './Input'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

export function PasswordInput({
  showPasswordLabel = 'Şifreyi göster',
  hidePasswordLabel = 'Şifreyi gizle',
  className = '',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={`pr-11 ${className}`} />
      <div className="absolute right-1 top-7">
        <IconButton
          type="button"
          label={visible ? hidePasswordLabel : showPasswordLabel}
          onClick={() => setVisible((current) => !current)}
          icon={visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
        />
      </div>
    </div>
  )
}
