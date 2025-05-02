import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantById } from "@/services/menuService";
import { setupDatabase, handleRelationDoesNotExistError } from "@/lib/setupDatabase";
import { supabase } from "@/integrations/supabase/client";
import { CategoryType, Restaurant } from "@/types/menu";
import { useIsMobile } from "@/hooks/use-mobile";

// Component imports
import LoadingState from "@/components/menu/LoadingState";
import ErrorState from "@/components/menu/ErrorState";
import PageHeader from "@/components/menu/PageHeader";
import DatabaseWarning from "@/components/menu/DatabaseWarning";
import RestaurantHeader from "@/components/menu/RestaurantHeader";
import MenuList from "@/components/menu/MenuList";
import MenuFooter from "@/components/menu/MenuFooter";
import Cart from "@/components/menu/Cart";
import SearchBar from "@/components/menu/SearchBar";
import CategoryTabs from "@/components/menu/CategoryTabs";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/toaster";
import LoadingAnimation from "@/components/LoadingAnimation";
import { OrderProvider } from '@/contexts/OrderContext';
import OrderHistory from '@/components/menu/OrderHistory';
import WaiterCallButton from '@/components/menu/WaiterCallButton';
import CategoryNavigationDialog from '@/components/menu/CategoryNavigationDialog';

// Sample data as fallback when API call fails or is loading
const sampleData: Restaurant = {
  id: "sample-restaurant",
  name: "Sample Restaurant",
  description: "This is a sample restaurant menu",
  categories: [
    {
      id: "sample-category-1",
      name: "Appetizers",
      items: [
        {
          id: "sample-item-1",
          name: "Garlic Bread",
          description: "Toasted bread with garlic butter",
          price: "5.99",
        },
        {
          id: "sample-item-2",
          name: "Mozzarella Sticks",
          description: "Breaded mozzarella with marinara sauce",
          price: "7.99",
        },
      ],
    },
  ],
};

const MenuPreview = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const [attemptedDatabaseSetup, setAttemptedDatabaseSetup] = useState(false);
  const [isDbError, setIsDbError] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<CategoryType>("food");
  const isMobile = useIsMobile();

  // Optimize query with better caching and error handling
  const { data: restaurant, isLoading, error, refetch } = useQuery({
    queryKey: ['restaurant', menuId],
    queryFn: async () => {
      if (!menuId) return null;
      
      try {
        console.log("Attempting to fetch restaurant with ID:", menuId);
        
        // Check if database connection is available
        try {
          const { data, error } = await supabase.from('restaurants').select('id').limit(1);
          if (error) {
            console.log("Supabase connection test failed:", error);
            setIsDbError(true);
            throw new Error("Database connection failed");
          }
        } catch (e) {
          console.log("Supabase connection test error:", e);
          setIsDbError(true);
          throw new Error("Database connection failed");
        }
        
        // Attempt to fetch the restaurant data
        const restaurantData = await getRestaurantById(menuId);
        
        if (!restaurantData) {
          console.log("Restaurant not found in database:", menuId);
          return null;
        }
        
        console.log("Successfully fetched restaurant from database:", restaurantData);
        return restaurantData;
      } catch (error: any) {
        // If we get a "relation does not exist" error, try to set up the database
        if (!attemptedDatabaseSetup) {
          const success = await handleRelationDoesNotExistError(error);
          setAttemptedDatabaseSetup(true);
          
          if (success) {
            console.log("Database tables created, retrying fetch...");
            return await getRestaurantById(menuId);
          }
        }
        
        console.log("Database fetch failed:", error);
        setIsDbError(true);
        throw error;
      }
    },
    retry: 1, // Reduce retry attempts
    staleTime: 60000, // Cache results for 1 minute to reduce refetching
    gcTime: 300000, // Keep unused data in cache for 5 minutes (renamed from cacheTime)
    enabled: !!menuId,
  });

  // Memoize restaurant data to prevent unnecessary rerenders
  const restaurantToDisplay = useMemo(() => 
    restaurant || (menuId === "sample-restaurant" ? sampleData : null),
  [restaurant, menuId]);

  // Initialize first category as open - optimized to run only when needed
  useEffect(() => {
    if (restaurantToDisplay && restaurantToDisplay.categories.length > 0) {
      const initialOpenState: Record<string, boolean> = {};
      restaurantToDisplay.categories.forEach((category, index) => {
        initialOpenState[category.id] = index === 0; // Open only the first category
      });
      setOpenCategories(initialOpenState);
    }
  }, [restaurantToDisplay?.categories]);

  // Toggle category open/closed state - optimized with useCallback
  const toggleCategory = useCallback((categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Handle search query changes - optimized with useCallback
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    // If there's a search query, open all categories
    if (query.trim() !== "") {
      if (restaurantToDisplay) {
        const allOpen: Record<string, boolean> = {};
        restaurantToDisplay.categories.forEach(category => {
          allOpen[category.id] = true;
        });
        setOpenCategories(allOpen);
      }
    }
  }, [restaurantToDisplay]);

  // Handle tab changes
  const handleTabChange = useCallback((tab: CategoryType) => {
    setActiveTab(tab);
    setSearchQuery("");
  }, []);

  // Retry setup if there's an error
  useEffect(() => {
    let mounted = true;
    
    if (isDbError && !attemptedDatabaseSetup) {
      setupDatabase().then(success => {
        if (mounted) {
          setAttemptedDatabaseSetup(true);
          if (success) {
            refetch();
          }
        }
      });
    }
    
    return () => { mounted = false; };
  }, [isDbError, attemptedDatabaseSetup, refetch]);
  
  // Memoize QR code value
  const qrCodeValue = useMemo(() => {
    if (!restaurantToDisplay) return '';
    
    // Include table ID in QR code if available
    const baseUrl = `${window.location.origin}/menu-preview/${restaurantToDisplay.id}`;
    return tableId ? `${baseUrl}?table=${tableId}` : baseUrl;
  }, [restaurantToDisplay, tableId]);
  
  // Check if we have a table ID to enable table features
  const isTableContext = !!tableId;
  
  // Show loading state
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Show not found state if we don't have data and we're not loading
  if (!isLoading && !restaurant && menuId !== "sample-restaurant") {
    return (
      <ErrorState 
        message="Menu not found" 
        description="This menu might not exist or has been deleted from the database." 
      />
    );
  }

  // Show error
  if (error && menuId !== "sample-restaurant") {
    console.error("Error loading menu:", error);
    return (
      <ErrorState 
        message="Could not load menu from database." 
        description="There was an error connecting to the database. Please try again later." 
      />
    );
  }

  if (!restaurantToDisplay) {
    return null; // Should never happen, but TypeScript wants this check
  }

  return (
    <CartProvider>
      <OrderProvider>
        <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen font-sans">
          <PageHeader qrCodeValue={qrCodeValue} />
          <DatabaseWarning isDbError={isDbError} />
          <RestaurantHeader 
            name={restaurantToDisplay.name} 
            description={restaurantToDisplay.description}
            image_url={restaurantToDisplay.image_url}
            google_review_link={restaurantToDisplay.google_review_link}
            location={restaurantToDisplay.location}
            phone={restaurantToDisplay.phone}
            wifi_password={restaurantToDisplay.wifi_password}
            opening_time={restaurantToDisplay.opening_time}
            closing_time={restaurantToDisplay.closing_time}
          />
          
          <div className="mb-4">
            <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <div className={isMobile ? "px-2" : "px-6"}>
            <SearchBar onSearch={handleSearch} />
            
            <MenuList 
              categories={restaurantToDisplay.categories} 
              openCategories={openCategories} 
              toggleCategory={toggleCategory}
              searchQuery={searchQuery}
              activeTab={activeTab}
            />
          </div>
          
          <MenuFooter />
          {tableId && (
            <WaiterCallButton 
              tableId={tableId} 
              restaurantId={restaurantToDisplay.id} 
            />
          )}

          <CategoryNavigationDialog
            categories={restaurantToDisplay.categories}
            openCategories={openCategories}
            toggleCategory={toggleCategory}
          />
        </div>
        <Cart tableId={tableId || undefined} />
        <OrderHistory tableId={tableId || undefined} />
        <Toaster />
      </OrderProvider>
    </CartProvider>
  );
};

export default MenuPreview;
