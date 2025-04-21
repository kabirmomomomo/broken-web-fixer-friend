
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

    // Check if orders table exists and create it with proper schema including table_id from the start
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('count(*)', { count: 'exact' });

    if (ordersError && ordersError.code === 'PGRST116') {
      // Orders table doesn't exist, create it with table_id column immediately
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
    else if (!ordersError) {
      // Orders table exists, explicitly check if table_id column exists and add it if not
      try {
        console.log('Orders table exists, checking for table_id column...');
        
        // First try to select using the table_id column to see if it exists
        const { error: columnCheckError } = await supabase
          .from('orders')
          .select('table_id')
          .limit(1);
          
        if (columnCheckError && columnCheckError.message && 
            columnCheckError.message.includes("table_id")) {
          console.log('table_id column missing, adding it now...');
          
          // Add the table_id column if it doesn't exist
          const { error: alterTableError } = await supabase.rpc(
            'create_column_if_not_exists',
            {
              table_name: 'orders',
              column_name: 'table_id',
              column_type: 'TEXT'
            }
          );

          if (alterTableError) {
            console.error('Error adding table_id column:', alterTableError);
            toast.error('Could not update orders table. Table orders may not work.');
            return false;
          }
          
          console.log('Successfully added table_id column to orders table');
          toast.success('Database schema updated successfully');
          return true;
        } else {
          console.log('table_id column already exists in orders table');
        }
      } catch (err) {
        console.error('Error checking/adding table_id column:', err);
        toast.error('Could not verify orders table structure. Some features may not work.');
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

// Supabase function to create a column if it doesn't exist
// Note: You may need to create this function in your Supabase project
export const createColumnIfNotExists = async (tableName: string, columnName: string, dataType: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'create_column_if_not_exists',
      {
        table_name: tableName,
        column_name: columnName,
        column_type: dataType
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
