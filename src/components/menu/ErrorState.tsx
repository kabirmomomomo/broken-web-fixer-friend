
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  description?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, description }) => {
  return (
    <div className="flex justify-center items-center min-h-screen flex-col">
      <p className="text-lg mb-4">{message}</p>
      {description && (
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
      )}
      <Link to="/menu-editor">
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Editor
        </Button>
      </Link>
    </div>
  );
};

export default ErrorState;
