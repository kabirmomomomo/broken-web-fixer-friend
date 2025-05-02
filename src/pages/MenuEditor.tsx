
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getUserRestaurant,
  saveRestaurantMenu,
  generateStableRestaurantId,
  uploadItemImage,
  RestaurantUI,
  MenuCategoryUI,
  MenuItemUI,
  MenuItemVariantUI,
  MenuItemAddonUI,
  MenuAddonOptionUI
} from "@/services/menuService";
import { CategoryType } from "@/types/menu"; // Add this import
import { useIsMobile } from "@/hooks/use-mobile";
import { lazy, Suspense } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation';
import {
  Dialog,
  DialogContent,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import debounce from "lodash/debounce";
import { saveState, loadState, hasUnsavedChanges, markChangesAsSaved } from '@/lib/statePersistence';

// Lazy load components
const RestaurantForm = lazy(() => import('@/components/menu/editor/RestaurantForm'));
const CategoriesList = lazy(() => import('@/components/menu/editor/CategoriesList'));
const MenuItemEditor = lazy(() => import('@/components/menu/editor/MenuItemEditor'));
const EmptyItemEditor = lazy(() => import('@/components/menu/editor/EmptyItemEditor'));
const EditorHeader = lazy(() => import('@/components/menu/editor/EditorHeader'));

const MenuEditor = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [restaurant, setRestaurant] = useState<RestaurantUI>({
    id: "",
    name: "My Restaurant",
    description: "Welcome to our restaurant",
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const { data: restaurantData, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const restaurant = await getUserRestaurant();
      return restaurant;
    },
    enabled: !!user,
  });

  const saveMenuMutation = useMutation({
    mutationFn: saveRestaurantMenu,
    onSuccess: () => {
      toast.success("Changes saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save changes. Please try again.");
      console.error("Save error:", error);
    },
  });

  const isMobile = useIsMobile();

  // Add debounced save function
  const debouncedSave = useCallback(
    debounce((data: typeof restaurant) => {
      saveMenuMutation.mutate(data);
    }, 1000),
    []
  );

  // Add state recovery
  useEffect(() => {
    if (!isLoadingRestaurant) {
      if (restaurantData) {
        // Check for saved state
        const savedState = loadState();
        if (savedState && savedState.id === restaurantData.id) {
          setRestaurant(savedState);
          
          const expanded: Record<string, boolean> = {};
          savedState.categories.forEach(category => {
            expanded[category.id] = false;
          });
          setExpandedCategories(expanded);
        } else {
          setRestaurant(restaurantData);
          
          const expanded: Record<string, boolean> = {};
          restaurantData.categories.forEach(category => {
            expanded[category.id] = false;
          });
          setExpandedCategories(expanded);
        }
      } else if (user?.id) {
        const stableId = generateStableRestaurantId(user.id);
        const newRestaurant: RestaurantUI = {
          id: stableId,
          name: "My Restaurant",
          description: "Welcome to our restaurant",
          categories: [],
        };
        setRestaurant(newRestaurant);
      }
      setIsLoading(false);
    }
  }, [restaurantData, isLoadingRestaurant, user]);

  // Save state to localStorage when changes occur
  useEffect(() => {
    saveState(restaurant);
  }, [restaurant]);

  // Add cleanup for debounced function
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const addCategory = () => {
    const newCategory: MenuCategoryUI = {
      id: uuidv4(),
      name: "New Category",
      items: [],
    };
    
    setRestaurant({
      ...restaurant,
      categories: [...restaurant.categories, newCategory],
    });
    
    setExpandedCategories(prev => ({
      ...prev,
      [newCategory.id]: true
    }));
    
    toast.success("Category added");
  };

  const updateCategory = (id: string, name: string, type?: CategoryType) => {
    setRestaurant(prev => {
      const newState = {
        ...prev,
        categories: prev.categories.map((category) =>
          category.id === id ? { ...category, name, type } : category
        ),
      };
      
      // Save changes immediately through the debounced function
      debouncedSave(newState);
      
      return newState;
    });
    
    console.log(`Updating category ${id} with name: ${name} and type: ${type || 'all'}`);
  };

  const deleteCategory = (id: string) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.filter((category) => category.id !== id),
    });
    toast.success("Category deleted");
  };

  const addMenuItem = (categoryId: string) => {
    const newItemId = uuidv4();
    
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: [
                ...category.items,
                {
                  id: newItemId,
                  name: "New Item",
                  description: "Item description",
                  price: "0.00",
                  is_visible: true,
                  is_available: true,
                  variants: [],
                  addons: []
                },
              ],
            }
          : category
      ),
    });
    
    setActiveItemId(newItemId);
    
    toast.success("Menu item added");
  };

  const updateMenuItem = (
    categoryId: string,
    itemId: string,
    field: keyof MenuItemUI,
    value: string | boolean
  ) => {
    setRestaurant(prev => {
      const newState = {
        ...prev,
        categories: prev.categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                items: category.items.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item
                ),
              }
            : category
        ),
      };
      return newState;
    });
  };

  const deleteMenuItem = (categoryId: string, itemId: string) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category
      ),
    });
    
    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
    
    toast.success("Menu item deleted");
  };

  const moveCategory = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === restaurant.categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...restaurant.categories];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const category = newCategories[index];
    newCategories[index] = newCategories[newIndex];
    newCategories[newIndex] = category;

    setRestaurant({
      ...restaurant,
      categories: newCategories,
    });
  };

  const moveMenuItem = (
    categoryIndex: number,
    itemIndex: number,
    direction: "up" | "down"
  ) => {
    if (
      (direction === "up" && itemIndex === 0) ||
      (direction === "down" &&
        itemIndex === restaurant.categories[categoryIndex].items.length - 1)
    ) {
      return;
    }

    const newCategories = [...restaurant.categories];
    const newItemIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    const items = [...newCategories[categoryIndex].items];
    const item = items[itemIndex];
    items[itemIndex] = items[newItemIndex];
    items[newItemIndex] = item;

    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      items,
    };

    setRestaurant({
      ...restaurant,
      categories: newCategories,
    });
  };

  const addVariant = (categoryId: string, itemId: string) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      variants: [
                        ...(item.variants || []),
                        {
                          id: uuidv4(),
                          name: "New Variant",
                          price: item.price,
                        },
                      ],
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const updateVariant = (
    categoryId: string,
    itemId: string,
    variantId: string,
    field: keyof MenuItemVariantUI,
    value: string
  ) => {
    // Optimistically update the UI
    setRestaurant(prev => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      variants: (item.variants || []).map((variant) =>
                        variant.id === variantId
                          ? { ...variant, [field]: value }
                          : variant
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    }));

    // Debounce the save operation
    debouncedSave({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      variants: (item.variants || []).map((variant) =>
                        variant.id === variantId
                          ? { ...variant, [field]: value }
                          : variant
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const deleteVariant = (
    categoryId: string,
    itemId: string,
    variantId: string
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      variants: (item.variants || []).filter(
                        (variant) => variant.id !== variantId
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const addAddon = (categoryId: string, itemId: string) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: [
                        ...(item.addons || []),
                        {
                          id: uuidv4(),
                          title: "New Add-on",
                          type: "Single choice",
                          options: [],
                        },
                      ],
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const updateAddon = (
    categoryId: string,
    itemId: string,
    addonId: string,
    field: keyof MenuItemAddonUI,
    value: string | "Single choice" | "Multiple choice"
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: (item.addons || []).map((addon) =>
                        addon.id === addonId
                          ? { ...addon, [field]: value }
                          : addon
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const deleteAddon = (
    categoryId: string,
    itemId: string,
    addonId: string
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: (item.addons || []).filter(
                        (addon) => addon.id !== addonId
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const addAddonOption = (
    categoryId: string,
    itemId: string,
    addonId: string
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: (item.addons || []).map((addon) =>
                        addon.id === addonId
                          ? {
                              ...addon,
                              options: [
                                ...(addon.options || []),
                                {
                                  id: uuidv4(),
                                  name: "New Option",
                                  price: "0.00",
                                },
                              ],
                            }
                          : addon
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const updateAddonOption = (
    categoryId: string,
    itemId: string,
    addonId: string,
    optionId: string,
    field: keyof MenuAddonOptionUI,
    value: string
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: (item.addons || []).map((addon) =>
                        addon.id === addonId
                          ? {
                              ...addon,
                              options: (addon.options || []).map((option) =>
                                option.id === optionId
                                  ? { ...option, [field]: value }
                                  : option
                              ),
                            }
                          : addon
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const deleteAddonOption = (
    categoryId: string,
    itemId: string,
    addonId: string,
    optionId: string
  ) => {
    setRestaurant({
      ...restaurant,
      categories: restaurant.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      addons: (item.addons || []).map((addon) =>
                        addon.id === addonId
                          ? {
                              ...addon,
                              options: (addon.options || []).filter(
                                (option) => option.id !== optionId
                              ),
                            }
                          : addon
                      ),
                    }
                  : item
              ),
            }
          : category
      ),
    });
  };

  const handleImageUpload = async (categoryId: string, itemId: string, file: File) => {
    try {
      const url = await uploadItemImage(file, itemId);
      if (url) {
        updateMenuItem(categoryId, itemId, "image_url", url);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleSaveMenu = () => {
    saveMenuMutation.mutate(restaurant, {
      onSuccess: () => {
        markChangesAsSaved();
        toast.success("Changes saved successfully");
      },
      onError: (error) => {
        toast.error("Failed to save changes. Please try again.");
        console.error("Save error:", error);
      }
    });
  };

  const handleSaveRestaurantDetails = async (details: Partial<typeof restaurant>) => {
    setRestaurant({
      ...restaurant,
      ...details
    });
    
    if (saveMenuMutation.isPending) return;
    saveMenuMutation.mutate({
      ...restaurant,
      ...details
    });
  };

  // Add warning when leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  let activeItem: MenuItemUI | null = null;
  let activeCategoryId: string | null = null;

  if (activeItemId) {
    for (const category of restaurant.categories) {
      const item = category.items.find(item => item.id === activeItemId);
      if (item) {
        activeItem = item;
        activeCategoryId = category.id;
        break;
      }
    }
  }

  const renderItemEditor = () => {
    if (!activeItem || !activeCategoryId) return null;

    return (
      <MenuItemEditor 
        activeItem={activeItem}
        activeCategoryId={activeCategoryId}
        updateMenuItem={updateMenuItem}
        addVariant={addVariant}
        updateVariant={updateVariant}
        deleteVariant={deleteVariant}
        addAddon={addAddon}
        updateAddon={updateAddon}
        deleteAddon={deleteAddon}
        addAddonOption={addAddonOption}
        updateAddonOption={updateAddonOption}
        deleteAddonOption={deleteAddonOption}
        handleImageUpload={handleImageUpload}
        handleSaveMenu={handleSaveMenu}
        setActiveItemId={setActiveItemId}
        isSaving={saveMenuMutation.isPending}
      />
    );
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4 max-w-7xl">
      <Suspense fallback={<LoadingAnimation />}>
        <EditorHeader 
          restaurant={restaurant}
          handleSaveMenu={handleSaveMenu}
          handleSaveRestaurantDetails={handleSaveRestaurantDetails}
          signOut={signOut}
          isSaving={saveMenuMutation.isPending}
        />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-4">
          <Suspense fallback={<LoadingAnimation />}>
            <RestaurantForm restaurant={restaurant} setRestaurant={setRestaurant} />
          </Suspense>

          <Separator className="my-4" />

          <Suspense fallback={<LoadingAnimation />}>
            <CategoriesList
              categories={restaurant.categories}
              expandedCategories={expandedCategories}
              toggleCategoryExpand={toggleCategoryExpand}
              updateCategory={updateCategory}
              deleteCategory={deleteCategory}
              moveCategory={moveCategory}
              addMenuItem={addMenuItem}
              moveMenuItem={moveMenuItem}
              deleteMenuItem={deleteMenuItem}
              setActiveItemId={setActiveItemId}
              addCategory={addCategory}
            />
          </Suspense>
        </div>

        <div>
          {isMobile ? (
            <Sheet open={!!activeItemId} onOpenChange={(open) => !open && setActiveItemId(null)}>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <Suspense fallback={<LoadingAnimation />}>
                  {renderItemEditor()}
                </Suspense>
              </SheetContent>
            </Sheet>
          ) : (
            <Dialog open={!!activeItemId} onOpenChange={(open) => !open && setActiveItemId(null)}>
              <DialogPortal>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <Suspense fallback={<LoadingAnimation />}>
                    {renderItemEditor()}
                  </Suspense>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          )}

          {!activeItemId && (
            <Suspense fallback={<LoadingAnimation />}>
              <EmptyItemEditor 
                hasCategories={restaurant.categories.length > 0}
                addCategory={addCategory}
                addMenuItem={addMenuItem}
                firstCategoryId={restaurant.categories.length > 0 ? restaurant.categories[0].id : undefined}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;
