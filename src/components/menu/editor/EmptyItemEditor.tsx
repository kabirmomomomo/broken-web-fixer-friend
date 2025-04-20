
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
    <div className="flex items-center justify-center h-full min-h-[250px] border border-dashed rounded-lg p-4 md:p-6">
      <div className="text-center">
        <h3 className="text-base md:text-lg font-medium mb-2">Item Editor</h3>
        <p className="text-sm text-muted-foreground mb-4 px-4">
          Select a menu item to edit its details, variants, and add-ons.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!hasCategories) {
              toast.info("Create a category first");
              addCategory();
            } else if (firstCategoryId) {
              addMenuItem(firstCategoryId);
            }
          }}
          className="h-8"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {!hasCategories ? "Create First Category" : "Create New Item"}
        </Button>
      </div>
    </div>
  );
};

export default EmptyItemEditor;
