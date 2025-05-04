
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Check, PlusCircle, Image as ImageIcon, Beef, LeafyGreen } from "lucide-react";
import { MenuItemUI, MenuItemVariantUI, MenuItemAddonUI, MenuAddonOptionUI } from "@/services/menuService";
import { toast } from "@/components/ui/sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MenuItemEditorProps {
  activeItem: MenuItemUI;
  activeCategoryId: string;
  updateMenuItem: (
    categoryId: string,
    itemId: string,
    field: keyof MenuItemUI,
    value: string | boolean | null
  ) => void;
  addVariant: (categoryId: string, itemId: string) => void;
  updateVariant: (
    categoryId: string,
    itemId: string,
    variantId: string,
    field: keyof MenuItemVariantUI,
    value: string
  ) => void;
  deleteVariant: (categoryId: string, itemId: string, variantId: string) => void;
  addAddon: (categoryId: string, itemId: string) => void;
  updateAddon: (
    categoryId: string,
    itemId: string,
    addonId: string,
    field: keyof MenuItemAddonUI,
    value: string | "Single choice" | "Multiple choice"
  ) => void;
  deleteAddon: (categoryId: string, itemId: string, addonId: string) => void;
  addAddonOption: (categoryId: string, itemId: string, addonId: string) => void;
  updateAddonOption: (
    categoryId: string,
    itemId: string,
    addonId: string,
    optionId: string,
    field: keyof MenuAddonOptionUI,
    value: string
  ) => void;
  deleteAddonOption: (
    categoryId: string,
    itemId: string,
    addonId: string,
    optionId: string
  ) => void;
  handleImageUpload: (categoryId: string, itemId: string, file: File) => void;
  handleSaveMenu: () => void;
  setActiveItemId: (itemId: string | null) => void;
  isSaving: boolean;
}

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  activeItem,
  activeCategoryId,
  updateMenuItem,
  addVariant,
  updateVariant,
  deleteVariant,
  addAddon,
  updateAddon,
  deleteAddon,
  addAddonOption,
  updateAddonOption,
  deleteAddonOption,
  handleImageUpload,
  handleSaveMenu,
  setActiveItemId,
  isSaving,
}) => {
  const [selectedTab, setSelectedTab] = useState("details");
  const [imagePreview, setImagePreview] = useState<string | null>(activeItem.image_url || null);

  // Add refs for input fields
  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const variantNameInputRef = useRef<HTMLInputElement>(null);
  const variantPriceInputRef = useRef<HTMLInputElement>(null);

  // Auto-select input fields when component mounts or when new item is added
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.select();
    }
  }, [activeItem.id]);

  // Auto-select variant input fields when new variant is added
  useEffect(() => {
    if (selectedTab === "variants" && variantNameInputRef.current) {
      variantNameInputRef.current.select();
    }
  }, [selectedTab, activeItem.variants?.length]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleImageUpload(activeCategoryId, activeItem.id, file);
    }
  };

  const handleDietaryTypeChange = (value: string) => {
    // Log before updating to see the current and new values
    console.log(`Changing dietary type from ${activeItem.dietary_type} to ${value === "none" ? null : value}`);
    
    // Make sure to pass the correct type value to the updateMenuItem function
    updateMenuItem(
      activeCategoryId,
      activeItem.id,
      "dietary_type",
      value === "none" ? null : value as "veg" | "non-veg"
    );
    
    // Log the change to ensure it's being properly captured
    console.log(`Set dietary type to: ${value}, activeItem now shows: ${activeItem.dietary_type}`);
    
    // Immediately save the menu to persist the change
    setTimeout(() => {
      handleSaveMenu();
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-md overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={activeItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <Label htmlFor="image-upload" className="cursor-pointer hover:underline">
                  Upload new image
                </Label>
                <Input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 500x500 pixels
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <Tabs defaultValue="details" className="space-y-4" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="p-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="addons">Add-ons</TabsTrigger>
            </TabsList>
            <Separator />
            <TabsContent value="details" className="space-y-4 p-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    ref={nameInputRef}
                    value={activeItem.name}
                    onChange={(e) =>
                      updateMenuItem(
                        activeCategoryId,
                        activeItem.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    ref={descriptionInputRef}
                    value={activeItem.description || ''}
                    onChange={(e) =>
                      updateMenuItem(
                        activeCategoryId,
                        activeItem.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="item-price">Price</Label>
                    <Input
                      id="item-price"
                      ref={priceInputRef}
                      value={activeItem.price}
                      onChange={(e) =>
                        updateMenuItem(
                          activeCategoryId,
                          activeItem.id,
                          "price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-old-price">Old Price</Label>
                    <Input
                      id="item-old-price"
                      value={activeItem.old_price || ""}
                      onChange={(e) =>
                        updateMenuItem(
                          activeCategoryId,
                          activeItem.id,
                          "old_price",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="item-weight">Weight</Label>
                    <Input
                      id="item-weight"
                      value={activeItem.weight || ""}
                      onChange={(e) =>
                        updateMenuItem(
                          activeCategoryId,
                          activeItem.id,
                          "weight",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                
                {/* Dietary Type Selection */}
                <div>
                  <Label htmlFor="dietary-type" className="mb-2 block">Dietary Type</Label>
                  <RadioGroup 
                    value={activeItem.dietary_type || "none"}
                    onValueChange={handleDietaryTypeChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="dietary-none" />
                      <Label htmlFor="dietary-none" className="cursor-pointer">Not specified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="veg" id="dietary-veg" />
                      <Label htmlFor="dietary-veg" className="cursor-pointer flex items-center">
                        <LeafyGreen className="h-4 w-4 mr-1 text-green-600" />
                        Vegetarian
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non-veg" id="dietary-non-veg" />
                      <Label htmlFor="dietary-non-veg" className="cursor-pointer flex items-center">
                        <Beef className="h-4 w-4 mr-1 text-red-600" />
                        Non-Vegetarian
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label htmlFor="item-visible">Visible</Label>
                  <Switch
                    id="item-visible"
                    checked={activeItem.is_visible}
                    onCheckedChange={(checked) =>
                      updateMenuItem(
                        activeCategoryId,
                        activeItem.id,
                        "is_visible",
                        checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="item-available">Available</Label>
                  <Switch
                    id="item-available"
                    checked={activeItem.is_available}
                    onCheckedChange={(checked) =>
                      updateMenuItem(
                        activeCategoryId,
                        activeItem.id,
                        "is_available",
                        checked
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="variants" className="space-y-4 p-4">
              {activeItem.variants && activeItem.variants.length > 0 ? (
                <div className="space-y-2">
                  {activeItem.variants.map((variant) => (
                    <Card key={variant.id} className="p-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor={`variant-name-${variant.id}`}>
                            Variant Name
                          </Label>
                          <Input
                            id={`variant-name-${variant.id}`}
                            ref={variantNameInputRef}
                            value={variant.name}
                            onChange={(e) =>
                              updateVariant(
                                activeCategoryId,
                                activeItem.id,
                                variant.id,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`variant-price-${variant.id}`}>
                            Variant Price
                          </Label>
                          <Input
                            id={`variant-price-${variant.id}`}
                            ref={variantPriceInputRef}
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(
                                activeCategoryId,
                                activeItem.id,
                                variant.id,
                                "price",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteVariant(activeCategoryId, activeItem.id, variant.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No variants added yet.</p>
              )}
              <Button
                onClick={() => addVariant(activeCategoryId, activeItem.id)}
                size="sm"
                variant="ghost"
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Variant
              </Button>
            </TabsContent>
            <TabsContent value="addons" className="space-y-4 p-4">
              {activeItem.addons && activeItem.addons.length > 0 ? (
                <div className="space-y-2">
                  {activeItem.addons.map((addon) => (
                    <Card key={addon.id} className="p-4">
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor={`addon-title-${addon.id}`}>
                            Add-on Title
                          </Label>
                          <Input
                            id={`addon-title-${addon.id}`}
                            value={addon.title}
                            onChange={(e) =>
                              updateAddon(
                                activeCategoryId,
                                activeItem.id,
                                addon.id,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`addon-type-${addon.id}`}>
                            Add-on Type
                          </Label>
                          <Input
                            id={`addon-type-${addon.id}`}
                            value={addon.type}
                            onChange={(e) =>
                              updateAddon(
                                activeCategoryId,
                                activeItem.id,
                                addon.id,
                                "type",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        {addon.options && addon.options.length > 0 ? (
                          <div className="space-y-2">
                            {addon.options.map((option) => (
                              <Card key={option.id} className="p-4">
                                <div className="grid gap-4">
                                  <div>
                                    <Label htmlFor={`option-name-${option.id}`}>
                                      Option Name
                                    </Label>
                                    <Input
                                      id={`option-name-${option.id}`}
                                      value={option.name}
                                      onChange={(e) =>
                                        updateAddonOption(
                                          activeCategoryId,
                                          activeItem.id,
                                          addon.id,
                                          option.id,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor={`option-price-${option.id}`}>
                                      Option Price
                                    </Label>
                                    <Input
                                      id={`option-price-${option.id}`}
                                      value={option.price}
                                      onChange={(e) =>
                                        updateAddonOption(
                                          activeCategoryId,
                                          activeItem.id,
                                          addon.id,
                                          option.id,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      deleteAddonOption(
                                        activeCategoryId,
                                        activeItem.id,
                                        addon.id,
                                        option.id
                                      )
                                    }
                                  >
                                    Delete Option
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No options added for this add-on yet.
                          </p>
                        )}
                        <Button
                          onClick={() =>
                            addAddonOption(activeCategoryId, activeItem.id, addon.id)
                          }
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add Option
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            deleteAddon(activeCategoryId, activeItem.id, addon.id)
                          }
                        >
                          Delete Add-on
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No add-ons added yet.</p>
              )}
              <Button
                onClick={() => addAddon(activeCategoryId, activeItem.id)}
                size="sm"
                variant="ghost"
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Add-on
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <div className="sticky bottom-0 mt-auto p-4 bg-background border-t flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => setActiveItemId(null)}>
          Cancel
        </Button>
        <Button onClick={handleSaveMenu} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default MenuItemEditor;
