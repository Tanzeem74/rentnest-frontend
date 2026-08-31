'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import api from '@/lib/api-client';

type Filters = {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
};

interface PropertyFiltersProps {
  onFilter: (filters: Filters) => void;
  initialFilters?: Filters;
}

export function PropertyFilters({ onFilter, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || '',
    location: initialFilters?.location || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    categoryId: initialFilters?.categoryId || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      categoryId: '',
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <Label htmlFor="search" className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Title or location..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
          <Input
            id="location"
            placeholder="City, area..."
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="h-9"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="h-9 w-full"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="h-9 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="category" className="text-sm font-medium">Category</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => handleChange('categoryId', value as string)}
          >
            <SelectTrigger id="category" className="h-9">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="w-full h-9">Apply Filters</Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-9 px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}