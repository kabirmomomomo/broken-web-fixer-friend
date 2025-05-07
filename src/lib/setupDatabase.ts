
import { supabase } from './supabase';
import { useToast } from '@/hooks/use-toast';

// Function to execute SQL commands directly - useful for database setup
export const executeSql = async (sqlString: string) => {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_string: sqlString });
    if (error) {
      console.error("Error executing SQL:", error);
      return { error };
    }
    return { data };
  } catch (error) {
    console.error("Exception executing SQL:", error);
    return { error };
  }
};

// Setup the database tables if they don't exist
export const setupDatabase = async (): Promise<boolean> => {
  try {
    console.log("Setting up database tables...");
    
    // Create restaurants table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        google_review_link TEXT,
        location TEXT,
        phone TEXT,
        wifi_password TEXT,
        opening_time TEXT,
        closing_time TEXT,
        payment_qr_code TEXT,
        upi_id TEXT,
        user_id UUID,
        orders_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
      );
    `);
    
    // Create menu categories table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        restaurant_id UUID NOT NULL,
        type TEXT,
        order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
      );
    `);
    
    // Create menu items table with dietary type column
    await executeSql(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        old_price TEXT,
        weight TEXT,
        image_url TEXT,
        is_visible BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        dietary_type TEXT,
        category_id UUID NOT NULL,
        order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
      );
    `);
    
    // Create menu item variants table
    await executeSql(`
      CREATE TABLE IF NOT EXISTS menu_item_variants (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        menu_item_id UUID NOT NULL,
        order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Add remaining table creations for addons, etc.
    
    console.log("Database setup completed successfully!");
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    // Instead of using toast directly, just log the error
    console.error("Database Setup Error: Failed to set up database tables. Please try again.");
    return false;
  }
};

// Check if an error is related to missing relations and set up the database if needed
export const handleRelationDoesNotExistError = async (error: any): Promise<boolean> => {
  if (!error) return false;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || (error.error && error.error.message) || JSON.stringify(error);
  
  if (
    errorMessage.includes('relation') && 
    errorMessage.includes('does not exist')
  ) {
    console.log("Relation does not exist error detected, setting up database...");
    return await setupDatabase();
  }
  
  return false;
};
