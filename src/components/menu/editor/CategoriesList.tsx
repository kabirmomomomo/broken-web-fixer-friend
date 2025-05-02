
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MenuCategoryUI } from "@/services/menuService";
import CategoryItem from "./CategoryItem";
import { CategoryType } from "@/types/menu";

interface CategoriesListProps {
  categories: MenuCategoryUI[];
  expandedCategories: Record<string, boolean>;
  toggleCategoryExpand: (categoryId: string) => void;
  updateCategory: (id: string, name: string, type?: CategoryType) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (index: number, direction: "up" | "down") => void;
  addMenuItem: (categoryId: string) => void;
  moveMenuItem: (categoryIndex: number, itemIndex: number, direction: "up" | "down") => void;
  deleteMenuItem: (categoryId: string, itemId: string) => void;
  setActiveItemId: (id: string | null) => void;
  addCategory: () => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  expandedCategories,
  toggleCategoryExpand,
  updateCategory,
  deleteCategory,
  moveCategory,
  addMenuItem,
  moveMenuItem,
  deleteMenuItem,
  setActiveItemId,
  addCategory
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-lg font-semibold">Menu Categories</h2>
        <Button 
          onClick={addCategory} 
          variant="outline" 
          size="sm" 
          className="h-7 px-2 md:px-3 gap-1"
        >
          <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Add Category</span>
          <span className="md:hidden">Add</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 border rounded-lg border-dashed">
          <p className="text-xs md:text-sm text-muted-foreground">
            No categories yet. Add your first category to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category, categoryIndex) => (
            <CategoryItem
              key={category.id}
              category={category}
              categoryIndex={categoryIndex}
              isExpanded={expandedCategories[category.id]}
              toggleExpand={toggleCategoryExpand}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              moveCategory={moveCategory}
              addMenuItem={addMenuItem}
              moveMenuItem={moveMenuItem}
              deleteMenuItem={deleteMenuItem}
              setActiveItemId={setActiveItemId}
              categoriesLength={categories.length}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
