
import { supabase } from './supabase';
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

    // Orders table setup with forced recreation of table_id column
    let ordersTableNeedsUpdate = false;
    
    // First check if orders table exists
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('count(*)', { count: 'exact' });
      
    if (ordersError && ordersError.code === 'PGRST116') {
      // Orders table doesn't exist, create it with table_id column
      console.log('Creating orders table with table_id column...');
      const { error: createOrdersError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'orders',
          table_definition: `
            id UUID PRIMARY KEY,
            restaurant_id UUID NOT NULL,
            table_id TEXT,
            device_id TEXT,
            user_id UUID,
            status TEXT DEFAULT 'placed',
            total_amount NUMERIC NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          `
        }
      );

      if (createOrdersError) {
        console.error('Error creating orders table:', createOrdersError);
        toast.error('Could not create orders table. Some features may not work.');
        return false;
      }
      console.log('Orders table created successfully with table_id column');
    } 
    else {
      // Orders table exists, check if table_id column exists
      try {
        // Force column check with direct SQL via RPC
        const { error: columnCheckError } = await supabase.rpc(
          'add_column_if_not_exists',
          {
            p_table: 'orders',
            p_column: 'table_id',
            p_type: 'TEXT'
          }
        );
        
        if (columnCheckError) {
          console.error('Error checking/adding table_id column via RPC:', columnCheckError);
          
          // Fallback approach: Try to use select to check if column exists
          const { error: selectError } = await supabase
            .from('orders')
            .select('table_id')
            .limit(1);
            
          if (selectError && selectError.message && 
              selectError.message.includes("table_id")) {
            console.log('table_id column missing, attempting to add it directly...');
            ordersTableNeedsUpdate = true;
          } else {
            console.log('table_id column appears to exist');
          }
        } else {
          console.log('table_id column check/add via RPC completed successfully');
        }
      } catch (err) {
        console.error('Error in table_id column check process:', err);
      }
    }

    // If we determined the orders table needs the column added:
    if (ordersTableNeedsUpdate) {
      try {
        console.log('Attempting to add table_id column...');
        
        // Try SQL alter table via RPC
        const { error: alterError } = await supabase.rpc(
          'execute_sql',
          {
            sql_query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id TEXT;'
          }
        );
        
        if (alterError) {
          console.error('Error adding table_id column via SQL:', alterError);
          toast.error('Could not update orders table structure. Some features may not work.');
          return false;
        }
        
        console.log('table_id column added successfully');
      } catch (err) {
        console.error('Exception during table_id column addition:', err);
        return false;
      }
    }

    // Check if order_items table exists
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .select('count(*)', { count: 'exact' });

    if (orderItemsError && orderItemsError.code === 'PGRST116') {
      // Order_items table doesn't exist, create it
      const { error: createOrderItemsError } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'order_items',
          table_definition: `
            id UUID PRIMARY KEY,
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            item_id TEXT,
            item_name TEXT NOT NULL,
            variant_id TEXT,
            variant_name TEXT,
            quantity INTEGER NOT NULL,
            price NUMERIC NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
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

// These functions will be needed for the RPC calls above
export const createRPCFunctions = async () => {
  try {
    // Create the add_column_if_not_exists function if it doesn't exist
    const { error: createColumnFnError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'add_column_if_not_exists',
        function_definition: `
          CREATE OR REPLACE FUNCTION add_column_if_not_exists(
            p_table text,
            p_column text,
            p_type text
          ) 
          RETURNS void AS $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = p_table AND column_name = p_column
            ) THEN
              EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', 
                           p_table, p_column, p_type);
            END IF;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }
    );

    if (createColumnFnError) {
      console.error('Error creating add_column_if_not_exists function:', createColumnFnError);
    }

    // Create the execute_sql function if it doesn't exist
    const { error: createSqlFnError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'execute_sql',
        function_definition: `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query text) 
          RETURNS void AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      }
    );

    if (createSqlFnError) {
      console.error('Error creating execute_sql function:', createSqlFnError);
    }

    return !createColumnFnError && !createSqlFnError;
  } catch (error) {
    console.error('Error creating RPC functions:', error);
    return false;
  }
};

// Attempt to create necessary RPC functions on load
createRPCFunctions().then(success => {
  if (success) {
    console.log('RPC functions created or already exist');
  }
});

// Helper function for column creation
export const createColumnIfNotExists = async (tableName: string, columnName: string, dataType: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'add_column_if_not_exists',
      {
        p_table: tableName,
        p_column: columnName,
        p_type: dataType
      }
    );
    
    if (error) {
      console.error(`Error creating ${columnName} column in ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception creating ${columnName} column in ${tableName}:`, error);
    return false;
  }
};
