import React, { useRef, useEffect } from 'react';

const NotFoundPage = () => {
  const canvasRef = useRef();

  return (
    <div className="relative h-screen bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500">
      {/* Background animation canvas */}
      <div ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center">
          <h1 className="text-9xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-medium text-gray-300">Page Not Found</h2>
          <p className="mt-4 text-lg text-gray-200">Oops! The page you're looking for doesn't exist.</p>
          <a
            href="/activation"
            className="mt-12 px-6 py-2 text-lg text-white bg-cyan-600 rounded hover:bg-cyan-700"
          >
            Go Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;