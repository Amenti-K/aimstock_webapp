import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchFiltersProps {
  onSearch: (name: string, phone: string) => void;
  isLoading?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, isLoading }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(name, phone);
  };

  const handleClear = () => {
    setName('');
    setPhone('');
    onSearch('', '');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <label htmlFor="company-name" className="text-sm font-medium text-foreground">
          Company Name
        </label>
        <Input
          id="company-name"
          placeholder="Search by company name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex-1 space-y-2">
        <label htmlFor="owner-phone" className="text-sm font-medium text-foreground">
          Owner Phone
        </label>
        <Input
          id="owner-phone"
          placeholder="Search by owner phone..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </form>
  );
};
