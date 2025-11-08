const Card = ({ children, className = '', onClick }) => {
  const baseStyles = 'bg-white rounded-lg shadow-md p-6';
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

