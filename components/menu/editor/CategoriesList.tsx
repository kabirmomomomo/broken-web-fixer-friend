
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MenuCategoryUI } from "@/services/menuService";
import CategoryItem from "./CategoryItem";

interface CategoriesListProps {
  categories: MenuCategoryUI[];
  expandedCategories: Record<string, boolean>;
  toggleCategoryExpand: (categoryId: string) => void;
  updateCategory: (id: string, name: string) => void;
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Categories</h2>
        <Button onClick={addCategory} variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 border rounded-lg border-dashed">
          <p className="text-muted-foreground">
            No categories yet. Add your first category to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
