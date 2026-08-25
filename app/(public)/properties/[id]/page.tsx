'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, ArrowLeft, Home, User, Mail, Phone, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  landlord: {
    name: string;
    email: string;
    phone: string;
  };
  amenities: string[];
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [requesting, setRequesting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [moveInDate, setMoveInDate] = useState(tomorrow.toISOString().split('T')[0]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data?.data || null);
      } catch (err) {
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err as { response: { data: { message: string } } };
          setError(errorResponse.response?.data?.message || 'Property not found');
        } else {
          setError('Property not found');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleRequestRent = async () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }
    if (user.role !== 'TENANT') {
      toast.error('Only tenants can request rent');
      return;
    }
    if (!moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }

    setRequesting(true);
    try {
      const payload = {
        propertyId: id,
        requestedMoveInDate: moveInDate,
      };
      await api.post('/rentals', payload);
      toast.success('Rental request submitted successfully!');
      setTimeout(() => {
        router.push('/tenant');
      }, 1500);
    } catch (err) {
      let errorMessage = 'Request failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response: { data: { message: string } } };
        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-300 h-96 rounded-lg"></div>
          <div className="bg-gray-300 h-8 w-3/4 rounded"></div>
          <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
          <div className="bg-gray-300 h-32 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Property not found'}</p>
        <Button onClick={() => router.push('/properties')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button onClick={() => router.push('/properties')} variant="outline" className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Properties
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={property.images?.[selectedImage] || '/placeholder.jpg'}
              alt={property.title}
              fill
              className="object-cover"
            />
          </div>
          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-20 cursor-pointer rounded-lg overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{property.title}</h1>
                <Badge
                  className={
                    property.status === 'AVAILABLE'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }
                >
                  {property.status}
                </Badge>
              </div>

              <p className="text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </p>

              <p className="text-3xl font-bold text-blue-600">
                ৳{Number(property.rentAmount).toLocaleString()}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </p>

              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms} beds
                </span>
                <span className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms} baths
                </span>
                <span className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {property.area} sqft
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600 text-sm">{property.description}</p>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((item, idx) => (
                      <Badge key={idx} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Listed by</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {property.landlord?.name || 'Unknown'}
                  </p>
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {property.landlord?.email || 'N/A'}
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {property.landlord?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              {property.status === 'AVAILABLE' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="moveInDate" className="text-sm font-medium">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Move-in Date
                    </Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <Button
                    onClick={handleRequestRent}
                    disabled={requesting || user?.role === 'LANDLORD' || !moveInDate}
                    className="w-full"
                  >
                    {requesting ? 'Submitting...' : 'Request to Rent'}
                  </Button>
                </div>
              )}

              {user?.role === 'LANDLORD' && (
                <p className="text-xs text-center text-gray-500">
                  You are a landlord. Switch to tenant to request rent.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}