import type { ComponentChildren } from 'preact';
import type { JSX } from 'preact';

interface ButtonProps {
  children: ComponentChildren;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps & Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'onClick'>) => {
  const classes = ['cta', variant && `cta--${variant}`, className].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  );
};
