import React, { ButtonHTMLAttributes } from 'react';
import './Button.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'custom-button',
    `custom-button--${variant}`,
    `custom-button--${size}`,
    fullWidth ? 'custom-button--full-width' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
