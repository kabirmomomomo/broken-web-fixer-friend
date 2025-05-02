import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuCategoryUI, MenuItemUI } from "@/services/menuService";
import { ChevronUp, ChevronDown, MoveUp, MoveDown, Trash2, PlusCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryType } from "@/types/menu";

interface CategoryItemProps {
  category: MenuCategoryUI;
  categoryIndex: number;
  isExpanded: boolean;
  toggleExpand: (categoryId: string) => void;
  updateCategory: (id: string, name: string, type?: CategoryType) => void;
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
  const handleCategoryTypeChange = (value: string) => {
    console.log(`Changing category type to: ${value}`);
    updateCategory(category.id, category.name, value as CategoryType);
  };

  return (
    <div className="border rounded-lg p-2 md:p-3 space-y-2 transition-all duration-200 hover:shadow-sm">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button 
            onClick={() => toggleExpand(category.id)}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
          <Input
            id={`category-${category.id}`}
            value={category.name}
            onChange={(e) => updateCategory(category.id, e.target.value, category.type)}
            className="h-8 text-sm md:text-base"
            placeholder="Category Name"
          />
        </div>
        
        <div className="flex items-center gap-1">
          <Select 
            value={category.type || "all"} 
            onValueChange={handleCategoryTypeChange}
          >
            <SelectTrigger className="h-8 w-24 md:w-28">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="liquor">Liquor</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
              <SelectItem value="revive">Revive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveCategory(categoryIndex, "up")}
            disabled={categoryIndex === 0}
            className="h-7 w-7"
          >
            <MoveUp className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveCategory(categoryIndex, "down")}
            disabled={categoryIndex === categoriesLength - 1}
            className="h-7 w-7"
          >
            <MoveDown className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteCategory(category.id)}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <>
          <Separator className="my-2" />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm md:text-base font-medium">Menu Items</h3>
              <Button
                onClick={() => addMenuItem(category.id)}
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-xs md:text-sm"
              >
                <PlusCircle className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Add Item</span>
                <span className="md:hidden">Add</span>
              </Button>
            </div>

            {category.items.length === 0 ? (
              <div className="text-center py-4 border rounded-lg border-dashed">
                <p className="text-xs md:text-sm text-muted-foreground">
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
    <div className="space-y-2">
      {items.map((item, itemIndex) => (
        <div
          key={item.id}
          className="border rounded-md p-2 transition-all duration-200 hover:shadow-sm"
        >
          <div className="flex justify-between items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-medium truncate">
                {item.name}
              </p>
              <p className="text-xs text-muted-foreground">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveItemId(item.id)}
                className="h-7 w-7"
              >
                <Pencil className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveMenuItem(categoryIndex, itemIndex, "up")}
                disabled={itemIndex === 0}
                className="h-7 w-7"
              >
                <MoveUp className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveMenuItem(categoryIndex, itemIndex, "down")}
                disabled={itemIndex === items.length - 1}
                className="h-7 w-7"
              >
                <MoveDown className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteMenuItem(categoryId, item.id)}
                className="h-7 w-7 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryItem;
