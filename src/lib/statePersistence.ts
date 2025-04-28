import { RestaurantUI } from "@/services/menuService";

const STORAGE_KEY = 'menu_editor_state';
const UNSAVED_CHANGES_KEY = 'menu_editor_unsaved_changes';

export const saveState = (state: RestaurantUI) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(UNSAVED_CHANGES_KEY, 'true');
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

export const loadState = (): RestaurantUI | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UNSAVED_CHANGES_KEY);
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};

export const hasUnsavedChanges = (): boolean => {
  try {
    return localStorage.getItem(UNSAVED_CHANGES_KEY) === 'true';
  } catch (error) {
    console.error('Error checking unsaved changes:', error);
    return false;
  }
};

export const markChangesAsSaved = () => {
  try {
    localStorage.setItem(UNSAVED_CHANGES_KEY, 'false');
  } catch (error) {
    console.error('Error marking changes as saved:', error);
  }
}; 
