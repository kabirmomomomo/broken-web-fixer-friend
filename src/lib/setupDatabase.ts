import { supabase } from './supabase';
import { executeSql } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const setupDatabase = async () => {
  try {
    console.log('Setting up database tables...');
    
    // Create restaurants table
    const { data: restaurantsData, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('count(*)', { count: 'exact' });

    if (restaurantsError && restaurantsError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createRestaurantsError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'restaurants',
          table_definition: `
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            user_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          `
        }
      );

      if (createRestaurantsError) {
        console.error('Error creating restaurants table:', createRestaurantsError);
        toast.error('Could not create restaurants table. Some features may not work.');
        return false;
      }
    }

    // Create menu_categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('menu_categories')
      .select('count(*)', { count: 'exact' });

    if (categoriesError && categoriesError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createCategoriesError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'menu_categories',
          table_definition: `
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            "order" INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          `
        }
      );

      if (createCategoriesError) {
        console.error('Error creating menu_categories table:', createCategoriesError);
        toast.error('Could not create menu_categories table. Some features may not work.');
        return false;
      }
    }

    // Create menu_items table
    const { data: itemsData, error: itemsError } = await supabase
      .from('menu_items')
      .select('count(*)', { count: 'exact' });

    if (itemsError && itemsError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createItemsError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'menu_items',
          table_definition: `
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price TEXT NOT NULL,
            category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
            "order" INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          `
        }
      );

      if (createItemsError) {
        console.error('Error creating menu_items table:', createItemsError);
        toast.error('Could not create menu_items table. Some features may not work.');
        return false;
      }
    }

    // Create tables table using raw SQL via RPC
    const { error: createTablesError } = await supabase.rpc(
      'create_table_if_not_exists',
      {
        table_name: 'tables',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
          table_number INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          UNIQUE(restaurant_id, table_number)
        `
      }
    );

    if (createTablesError) {
      console.error('Error creating tables table:', createTablesError);
      toast.error('Could not create tables table. Some features may not work.');
      return false;
    }

    // Create orders table with restaurant_id reference and table_id reference
    const { error: createOrdersError } = await supabase.rpc(
      'create_table_if_not_exists',
      {
        table_name: 'orders',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
          table_id TEXT,
          device_id TEXT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT NOT NULL DEFAULT 'placed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          user_id UUID
        `
      }
    );

    if (createOrdersError) {
      console.error('Error creating orders table:', createOrdersError);
      toast.error('Could not create orders table. Some features may not work.');
      return false;
    }

    // Create order_items table with restaurant_id reference
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('count(*)', { count: 'exact' });

    if (orderItemsError && orderItemsError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createOrderItemsError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'order_items',
          table_definition: `
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            restaurant_id UUID NOT NULL,
            item_id UUID,
            item_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            variant_name TEXT,
            variant_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
          `
        }
      );

      if (createOrderItemsError) {
        console.error('Error creating order_items table:', createOrderItemsError);
        toast.error('Could not create order_items table. Some features may not work.');
        return false;
      }
    }

    console.log('Database tables setup complete!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    toast.error('Database setup failed. Please try again.');
    return false;
  }
};

export const handleRelationDoesNotExistError = async (error: any): Promise<boolean> => {
  if (error?.message?.includes("relation") && error?.message?.includes("does not exist")) {
    console.log("Detected missing table error, attempting database setup...");
    return await setupDatabase();
  }
  return false;
};

export const handleTableConstraints = async () => {
  try {
    // First create the tables table if it doesn't exist
    const { error: createError } = await supabase.rpc(
      'create_table_if_not_exists',
      {
        table_name: 'tables',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
          table_number INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        `
      }
    );

    if (createError) {
      console.error('Error creating tables table:', createError);
      return false;
    }

    // Instead of using supabase client for tables_temp, use the executeSql function
    const { error: tempTableError } = await executeSql(`
      CREATE TABLE IF NOT EXISTS tables_temp (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        restaurant_id UUID NOT NULL,
        table_number INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
      );
    `);

    if (tempTableError) {
      console.error('Error creating temporary table:', tempTableError);
      return false;
    }

    // Create a test entry using raw SQL via executeSql
    const { error: insertError } = await executeSql(`
      INSERT INTO tables_temp (restaurant_id, table_number) 
      VALUES ('00000000-0000-0000-0000-000000000000', 0)
      ON CONFLICT DO NOTHING
    `);

    if (insertError && !insertError.message.includes('does not exist')) {
      console.error('Error with temporary operation:', insertError);
      return false;
    }

    // Drop the old table and recreate it with correct constraints
    const { error: recreateError } = await supabase.rpc(
      'create_table_if_not_exists',
      {
        table_name: 'tables',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
          table_number INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          UNIQUE(restaurant_id, table_number)
        `
      }
    );

    if (recreateError) {
      console.error('Error recreating tables table:', recreateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error handling table constraints:', error);
    return false;
  }
};
