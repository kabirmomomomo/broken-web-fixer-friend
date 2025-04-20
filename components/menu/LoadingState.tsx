
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <p className="text-lg mt-8 text-muted-foreground">Loading menu...</p>
      </div>
    </div>
  );
};

export default LoadingState;
