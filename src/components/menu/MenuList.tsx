
import React from "react";
import MenuCategory from "./MenuCategory";
import { CategoryType, MenuCategory as MenuCategoryType } from "@/types/menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MenuListProps {
  categories: MenuCategoryType[];
  openCategories: Record<string, boolean>;
  toggleCategory: (categoryId: string) => void;
  searchQuery?: string;
  activeTab?: CategoryType;
}

const MenuList: React.FC<MenuListProps> = ({ 
  categories, 
  openCategories, 
  toggleCategory,
  searchQuery = "",
  activeTab = "all"
}) => {
  const isMobile = useIsMobile();
  
  // Filter categories by tab and search
  const filteredCategories = categories
    .filter(category => {
      // First filter by active tab
      if (activeTab === "all" || category.type === undefined) {
        return true;
      }
      return category.type === activeTab;
    })
    .map(category => {
      // Then filter items by search query and visibility
      const filteredItems = category.items
        .filter(item => item.is_visible !== false) // Only show visible items
        .filter(item => !searchQuery || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Also search in variants
          item.variants?.some(variant => 
            variant.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          // Also search in addons
          item.addons?.some(addon => 
            addon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            addon.options.some(option => 
              option.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        );
      
      // Return category with filtered items
      return {
        ...category,
        items: filteredItems,
      };
    }).filter(category => category.items.length > 0 || !searchQuery);

  if (filteredCategories.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl border-dashed animate-fade-in">
        <p className="text-muted-foreground">
          {searchQuery 
            ? "No items match your search." 
            : activeTab !== "all" 
              ? `No items found in the ${activeTab} category.`
              : "No categories yet. Go to the menu editor to add categories and items."
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "space-y-6",
      isMobile ? "px-2" : ""
    )}>
      {filteredCategories.map((category, categoryIndex) => (
        <MenuCategory
          key={category.id}
          category={category}
          isOpen={openCategories[category.id] || !!searchQuery}
          toggleCategory={toggleCategory}
          categoryIndex={categoryIndex}
        />
      ))}
    </div>
  );
};

export default MenuList;
