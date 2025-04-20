
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface EmptyItemEditorProps {
  hasCategories: boolean;
  addCategory: () => void;
  addMenuItem: (categoryId: string) => void;
  firstCategoryId?: string;
}

const EmptyItemEditor: React.FC<EmptyItemEditorProps> = ({
  hasCategories,
  addCategory,
  addMenuItem,
  firstCategoryId,
}) => {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed rounded-lg p-8">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Item Editor</h3>
        <p className="text-muted-foreground mb-4">
          Select a menu item to edit its details, variants, and add-ons.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (!hasCategories) {
                toast.info("Create a category first");
                addCategory();
              } else if (firstCategoryId) {
                addMenuItem(firstCategoryId);
              }
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {!hasCategories 
              ? "Create First Category" 
              : "Create New Item"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyItemEditor;
