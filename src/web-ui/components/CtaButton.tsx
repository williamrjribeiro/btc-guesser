import type { ComponentChildren } from 'preact';
import type { JSX } from 'preact';
import './cta.css';

interface CtaButtonProps {
  children: ComponentChildren;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const CtaButton = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}: CtaButtonProps & Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'onClick'>) => {
  const classes = ['cta', variant && `cta--${variant}`, className].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={disabled} type={type} {...props}>
      {children}
    </button>
  );
};
