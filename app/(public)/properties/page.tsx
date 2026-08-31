'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Home, Filter } from 'lucide-react';
import { PropertyFilters } from '@/components/properties/PropertyFilters';

type Property = {
  id: string;
  title: string;
  description: string;
  rentAmount: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  category: { name: string };
  images: string[];
  status: 'AVAILABLE' | 'RENTED';
};

type Filters = {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;
};

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') ?? '',
    location: searchParams.get('location') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    categoryId: searchParams.get('categoryId') ?? '',
  });

  useEffect(() => {
    let ignore = false;

    const fetchProperties = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.location) params.append('location', filters.location);
        if (filters.minPrice) params.append('minRent', filters.minPrice);   // 🔁 Changed to minRent
        if (filters.maxPrice) params.append('maxRent', filters.maxPrice);   // 🔁 Changed to maxRent
        if (filters.categoryId) params.append('categoryId', filters.categoryId);

        const queryString = params.toString();
        const url = `/properties${queryString ? `?${queryString}` : ''}`;
        console.log('🔍 Fetching URL:', url);  // 🔍 দেখো কনসোলে
        router.replace(url, { scroll: false });

        const res = await api.get(`/properties?${queryString}`);
        if (!ignore) {
          const propertyData = res.data?.data?.data || res.data?.data || res.data || [];
          setProperties(Array.isArray(propertyData) ? propertyData : []);
        }
      } catch (err) {
        if (!ignore) {
          let errorMessage = 'Failed to load properties';
          if (err && typeof err === 'object' && 'response' in err) {
            const errorResponse = err as { response: { data: { message: string } } };
            errorMessage = errorResponse.response?.data?.message || errorMessage;
          }
          setError(errorMessage);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      ignore = true;
    };
  }, [filters, router]);

  const handleFilter = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Properties</h1>
          <div className="animate-pulse h-10 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="bg-gray-100 p-4 rounded-b-lg space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => setFilters({ ...filters })} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="mb-6">
        <div className="hidden lg:block">
          <PropertyFilters onFilter={handleFilter} initialFilters={filters} />
        </div>
        {showFilters && (
          <div className="lg:hidden mt-4">
            <PropertyFilters onFilter={handleFilter} initialFilters={filters} />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500">{properties.length} properties found</p>
        {(filters.search || filters.location || filters.minPrice || filters.maxPrice || filters.categoryId) && (
          <Button variant="ghost" size="sm" onClick={() => handleFilter({ search: '', location: '', minPrice: '', maxPrice: '', categoryId: '' })}>
            Clear all filters
          </Button>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No properties match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={property.images?.[0] || '/placeholder.jpg'}
                      alt={property.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        property.status === 'AVAILABLE'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {property.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold truncate">{property.title}</h2>
                  <p className="text-gray-500 text-sm flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.location}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ৳{Number(property.rentAmount).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      {property.bathrooms}
                    </span>
                    <span className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      {property.area} sqft
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Badge variant="outline" className="text-xs">
                    {property.category?.name || 'Uncategorized'}
                  </Badge>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}