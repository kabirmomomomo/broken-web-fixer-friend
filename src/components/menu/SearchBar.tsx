
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="relative mb-6 group">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-blue-500" />
      </div>
      <Input
        type="text"
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={handleSearch}
        className="pl-10 bg-white border-2 border-gray-100 focus:border-blue-400 shadow-sm rounded-xl transition-all duration-300 hover:shadow-md focus:shadow-md"
      />
    </div>
  );
};

export default SearchBar;
