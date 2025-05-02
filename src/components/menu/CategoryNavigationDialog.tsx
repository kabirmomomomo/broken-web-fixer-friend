import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, ChevronRight, ChevronDown } from "lucide-react";
import { MenuCategory } from "@/types/menu";
import { cn } from "@/lib/utils";

interface CategoryNavigationDialogProps {
  categories: MenuCategory[];
  openCategories: Record<string, boolean>;
  toggleCategory: (categoryId: string) => void;
}

const CategoryNavigationDialog: React.FC<CategoryNavigationDialogProps> = ({
  categories,
  openCategories,
  toggleCategory,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-8 z-50" ref={dialogRef}>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none transition-all duration-300 hover:scale-105",
          isOpen && "rotate-180"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <List className="h-6 w-6 transition-transform duration-300" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-64 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border animate-in slide-in-from-bottom-4">
          <ScrollArea className="h-[60vh] p-4">
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between font-medium transition-all duration-200 hover:bg-accent/50 group",
                    openCategories[category.id] && "bg-accent"
                  )}
                  onClick={() => {
                    scrollToCategory(category.id);
                    toggleCategory(category.id);
                  }}
                >
                  <span className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-accent-foreground group-hover:text-primary transition-colors duration-200">
                        {category.icon}
                      </span>
                    )}
                    <span className="group-hover:text-primary transition-colors duration-200">
                      {category.name}
                    </span>
                  </span>
                  {openCategories[category.id] ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default CategoryNavigationDialog; 