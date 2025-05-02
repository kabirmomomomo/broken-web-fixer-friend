import React from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import MenuItem from "./MenuItem";
import { MenuCategory as MenuCategoryType } from "@/types/menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuCategoryProps {
  category: MenuCategoryType;
  isOpen: boolean;
  toggleCategory: (categoryId: string) => void;
  categoryIndex: number;
}

const MenuCategory: React.FC<MenuCategoryProps> = ({
  category,
  isOpen,
  toggleCategory,
  categoryIndex,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Collapsible
      key={category.id}
      id={`category-₹{category.id}`}
      open={isOpen}
      onOpenChange={() => toggleCategory(category.id)}
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-500",
        "hover:shadow-lg animate-fade-in",
        isOpen
          ? "bg-white shadow-md"
          : "bg-gradient-to-tr from-[#f0f6ff] via-white to-[#f0f6ff]/60",
        categoryIndex % 2 === 0
          ? "border-blue-100"
          : "border-purple-100"
      )}
    >
      <CollapsibleTrigger className="w-full px-6 py-5 flex items-center justify-between cursor-pointer group transition-colors">
        <h2 className={cn(
          "font-semibold w-full flex items-center justify-between text-blue-950 group-hover:text-blue-600",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          {category.name}
          <span className="ml-2">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-blue-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-400 group-hover:text-blue-600 transition-transform" />
            )}
          </span>
        </h2>
      </CollapsibleTrigger>

      <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className={cn(
          "space-y-6",
          isMobile ? "p-3" : "p-6"
        )}>
          {category.items.length === 0 ? (
            <p className="text-center text-muted-foreground italic">
              No items in this category
            </p>
          ) : (
            category.items.map((item, index) => (
              <MenuItem key={item.id} item={item} index={index} />
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MenuCategory;
