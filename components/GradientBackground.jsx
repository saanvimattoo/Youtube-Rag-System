const GradientBackground = () => {
  return (
    
    <div className="absolute top-0 left-0 w-full h-full opacity-30 z-0">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-pink-500 rounded-full filter blur-3xl"></div>
    </div>
  );
};

export default GradientBackground;
