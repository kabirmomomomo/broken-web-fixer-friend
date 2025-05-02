
  export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    old_price?: string;
    weight?: string;
    image_url?: string;
    is_visible?: boolean;
    is_available?: boolean;
    variants?: MenuItemVariant[];
    addons?: MenuItemAddon[];
  }

  export interface MenuItemVariant {
    id: string;
    name: string;
    price: string;
  }

  export interface MenuItemAddon {
    id: string;
    title: string;
    type: string;
    options: MenuAddonOption[];
  }

  export interface MenuAddonOption {
    id: string;
    name: string;
    price: string;
  }

  export type CategoryType = "food" | "liquor" | "beverages" | "revive" | "all";

  export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItem[];
    icon?: string;
    type?: CategoryType;
  }

  export interface Restaurant {
    id: string;
    name: string;
    description: string;
    categories: MenuCategory[];
    image_url?: string;
    google_review_link?: string;
    location?: string;
    phone?: string;
    wifi_password?: string;
    opening_time?: string;
    closing_time?: string;
  }
