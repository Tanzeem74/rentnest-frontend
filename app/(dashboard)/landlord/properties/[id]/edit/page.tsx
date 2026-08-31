'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  rentAmount: z.string().min(1, 'Rent amount is required'),
  bedrooms: z.string().min(1, 'Number of bedrooms is required'),
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  area: z.string().min(1, 'Area is required'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.string().optional(),
  amenities: z.string().optional(),
  status: z.enum(['AVAILABLE', 'RENTED']),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

type Category = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  categoryId: string;
  images: string[];
  amenities: string[];
  status: 'AVAILABLE' | 'RENTED';
};

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      rentAmount: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      categoryId: '',
      images: '',
      amenities: '',
      status: 'AVAILABLE',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertyRes, categoriesRes] = await Promise.all([
          api.get(`/properties/${id}`),
          api.get('/categories'),
        ]);

        const property = propertyRes.data?.data;
        if (property) {
          form.reset({
            title: property.title || '',
            description: property.description || '',
            location: property.location || '',
            rentAmount: String(property.rentAmount || ''),
            bedrooms: String(property.bedrooms || ''),
            bathrooms: String(property.bathrooms || ''),
            area: String(property.area || ''),
            categoryId: property.categoryId || '',
            images: property.images?.join(', ') || '',
            amenities: property.amenities?.join(', ') || '',
            status: property.status || 'AVAILABLE',
          });
        }

        setCategories(categoriesRes.data?.data || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast.error('Failed to load property data');
        router.push('/landlord');
      } finally {
        setLoadingProperty(false);
      }
    };
    fetchData();
  }, [id, form, router]);

  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        rentAmount: Number(data.rentAmount),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        area: Number(data.area),
        images: data.images ? data.images.split(',').map(s => s.trim()) : [],
        amenities: data.amenities ? data.amenities.split(',').map(s => s.trim()) : [],
      };
      await api.patch(`/landlord/properties/${id}`, payload);
      toast.success('Property updated successfully!');
      router.push('/landlord');
    } catch (err) {
      let errorMessage = 'Failed to update property';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response: { data: { message: string } } };
        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Luxury Apartment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your property..." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Dhaka, Bangladesh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Amount (BDT)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqft)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="RENTED">Rented</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="WiFi, Parking, Lift" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Updating...' : 'Update Property'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}