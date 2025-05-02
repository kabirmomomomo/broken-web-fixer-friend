
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';

export const uploadRestaurantImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `restaurants/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      toast.error('Failed to upload image');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadRestaurantImage:', error);
    toast.error('Failed to upload image');
    return null;
  }
};
