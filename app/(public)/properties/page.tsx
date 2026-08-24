'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin, Bed, Bath, Square } from 'lucide-react';

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        console.log('Full response:', res.data);

        const propertyData = res.data?.data?.data || res.data?.data || res.data || [];

        if (!Array.isArray(propertyData)) {
          console.warn('Properties data is not an array:', propertyData);
          setProperties([]);
        } else {
          setProperties(propertyData);
        }
      } catch (err: unknown) {
        console.error('Error fetching properties:', err);
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No properties available right now.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <p className="text-gray-500">{properties.length} properties found</p>
      </div>

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
    </div>
  );
}