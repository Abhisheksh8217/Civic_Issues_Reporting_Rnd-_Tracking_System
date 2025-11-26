function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-2"></div>
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
}

export default Loader;
