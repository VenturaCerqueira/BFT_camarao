import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center';

  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };

  const classes = `${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
