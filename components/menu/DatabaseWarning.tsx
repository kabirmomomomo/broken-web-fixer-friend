
import React from "react";

interface DatabaseWarningProps {
  isDbError: boolean;
}

const DatabaseWarning: React.FC<DatabaseWarningProps> = ({ isDbError }) => {
  if (!isDbError) return null;
  
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <p className="text-yellow-800">
        Note: Database connection issue detected. The menu might not show the latest changes.
      </p>
    </div>
  );
};

export default DatabaseWarning;
