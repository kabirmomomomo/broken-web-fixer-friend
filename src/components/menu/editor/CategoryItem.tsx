import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MenuCategoryUI, MenuItemUI } from "@/services/menuService";
import { ChevronUp, ChevronDown, MoveUp, MoveDown, Trash2, PlusCircle } from "lucide-react";

interface CategoryItemProps {
  category: MenuCategoryUI;
  categoryIndex: number;
  isExpanded: boolean;
  toggleExpand: (categoryId: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (index: number, direction: "up" | "down") => void;
  addMenuItem: (categoryId: string) => void;
  moveMenuItem: (categoryIndex: number, itemIndex: number, direction: "up" | "down") => void;
  deleteMenuItem: (categoryId: string, itemId: string) => void;
  setActiveItemId: (id: string | null) => void;
  categoriesLength: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  categoryIndex,
  isExpanded,
  toggleExpand,
  updateCategory,
  deleteCategory,
  moveCategory,
  addMenuItem,
  moveMenuItem,
  deleteMenuItem,
  setActiveItemId,
  categoriesLength,
}) => {
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Auto-select category name input when component mounts
  useEffect(() => {
    if (categoryInputRef.current) {
      categoryInputRef.current.select();
    }
  }, [category.id]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleExpand(category.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            <Label htmlFor={`category-${category.id}`}>
              Category Name
            </Label>
          </div>
          <Input
            id={`category-${category.id}`}
            ref={categoryInputRef}
            value={category.name}
            onChange={(e) =>
              updateCategory(category.id, e.target.value)
            }
          />
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveCategory(categoryIndex, "up")}
            disabled={categoryIndex === 0}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => moveCategory(categoryIndex, "down")}
            disabled={categoryIndex === categoriesLength - 1}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteCategory(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Menu Items</h3>
              <Button
                onClick={() => addMenuItem(category.id)}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {category.items.length === 0 ? (
              <div className="text-center py-6 border rounded-lg border-dashed">
                <p className="text-muted-foreground">
                  No items in this category yet.
                </p>
              </div>
            ) : (
              <CategoryItemsList 
                items={category.items} 
                categoryId={category.id} 
                categoryIndex={categoryIndex} 
                moveMenuItem={moveMenuItem} 
                deleteMenuItem={deleteMenuItem} 
                setActiveItemId={setActiveItemId} 
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface CategoryItemsListProps {
  items: MenuItemUI[];
  categoryId: string;
  categoryIndex: number;
  moveMenuItem: (categoryIndex: number, itemIndex: number, direction: "up" | "down") => void;
  deleteMenuItem: (categoryId: string, itemId: string) => void;
  setActiveItemId: (id: string | null) => void;
}

const CategoryItemsList: React.FC<CategoryItemsListProps> = ({
  items,
  categoryId,
  categoryIndex,
  moveMenuItem,
  deleteMenuItem,
  setActiveItemId,
}) => {
  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          className="border rounded-md p-3"
        >
          <div className="flex justify-between items-center">
            <div className="flex-1 font-medium truncate">
              {item.name} - ${parseFloat(item.price).toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveItemId(item.id)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveMenuItem(categoryIndex, itemIndex, "up")}
                disabled={itemIndex === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => moveMenuItem(categoryIndex, itemIndex, "down")}
                disabled={itemIndex === items.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMenuItem(categoryId, item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryItem;
