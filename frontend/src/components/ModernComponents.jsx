import { motion } from 'framer-motion';

const ModernHeader = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`modern-header ${className}`}
    >
      {children}
    </motion.header>
  );
};

const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  delay = 0 
}) => {
  const variants = {
    default: 'cyber-card',
    glass: 'cyber-card bg-opacity-10 backdrop-blur-md',
    neon: 'cyber-card border-2 shadow-lg',
  };

  const hoverAnimation = hover ? {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 }
  } : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverAnimation}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

const ModernButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'cyber-btn bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-inverse',
    secondary: 'cyber-btn bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-inverse',
    ghost: 'cyber-btn bg-transparent border-none text-primary hover:bg-primary hover:bg-opacity-10',
    solid: 'bg-primary text-inverse border-none hover:bg-primary-dark'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        relative overflow-hidden
      `}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        </motion.div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </motion.button>
  );
};

const ModernInput = ({ 
  label, 
  error, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'cyber-input',
    floating: 'cyber-input peer placeholder-transparent',
    glass: 'cyber-input bg-opacity-10 backdrop-blur-md'
  };

  return (
    <div className="relative">
      <motion.input
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${variants[variant]} ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      
      {label && variant === 'floating' && (
        <label className="absolute left-3 -top-6 text-sm text-muted peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-focus:-top-6 peer-focus:text-sm peer-focus:text-primary transition-all duration-200">
          {label}
        </label>
      )}
      
      {label && variant !== 'floating' && (
        <label className="block text-sm font-medium text-secondary mb-1">
          {label}
        </label>
      )}
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-danger"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

const ModernContainer = ({ children, className = '', size = 'default' }) => {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`container-cyber ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
};

const ModernGrid = ({ 
  children, 
  columns = 'auto-fit', 
  gap = 'md',
  className = '' 
}) => {
  const gaps = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const gridClasses = columns === 'auto-fit' ? 'grid-auto-fit' : 
                     columns === 'auto-fill' ? 'grid-auto-fill' :
                     `grid-cols-${columns}`;

  return (
    <div className={`grid ${gridClasses} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
};

const ModernSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`
        ${sizes[size]} 
        ${colors[color]} 
        border-2 border-t-transparent rounded-full
      `}
    />
  );
};

const ModernModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-modal-backdrop bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          cyber-card ${sizes[size]} w-full
          bg-primary p-6 rounded-lg shadow-xl
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-cyber text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-primary transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

export {
  ModernHeader,
  ModernCard,
  ModernButton,
  ModernInput,
  ModernContainer,
  ModernGrid,
  ModernSpinner,
  ModernModal
};