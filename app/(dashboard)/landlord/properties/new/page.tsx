'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const propertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters'),

  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters'),

  location: z
    .string()
    .trim()
    .min(2, 'Location is required'),

  rentAmount: z
    .string()
    .min(1, 'Rent amount is required')
    .refine(
      (value) => Number(value) > 0,
      'Rent amount must be greater than 0'
    ),

  bedrooms: z
    .string()
    .min(1, 'Number of bedrooms is required')
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      'Bedrooms must be a valid number'
    ),

  bathrooms: z
    .string()
    .min(1, 'Number of bathrooms is required')
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
      'Bathrooms must be a valid number'
    ),

  propertyType: z.enum([
    'APARTMENT',
    'HOUSE',
    'STUDIO',
    'VILLA',
    'OFFICE',
  ]),

  categoryId: z
    .string()
    .min(1, 'Category is required'),

  status: z.enum(['AVAILABLE', 'RENTED']),

  images: z.string().optional(),

  amenities: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

type Category = {
  id: string;
  name: string;
};

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error
  ) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
    };

    return (
      apiError.response?.data?.message ||
      apiError.response?.data?.error ||
      'Failed to create property'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to create property';
}

export default function CreatePropertyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),

    defaultValues: {
      title: '',
      description: '',
      location: '',
      rentAmount: '',
      bedrooms: '',
      bathrooms: '',
      propertyType: 'APARTMENT',
      categoryId: '',
      status: 'AVAILABLE',
      images: '',
      amenities: '',
    },
  });

  useEffect(() => {
    let cancelled = false;

    api
      .get('/categories')
      .then((response) => {
        if (cancelled) {
          return;
        }

        const responseData = response.data;

        let categoryData: Category[] = [];

        if (Array.isArray(responseData)) {
          categoryData = responseData;
        } else if (Array.isArray(responseData?.data)) {
          categoryData = responseData.data;
        } else if (Array.isArray(responseData?.data?.data)) {
          categoryData = responseData.data.data;
        }

        setCategories(categoryData);
        setLoadingCategories(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setLoadingCategories(false);
        toast.error('Failed to load categories');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setLoading(true);

      const images = data.images
        ? data.images
            .split(',')
            .map((image) => image.trim())
            .filter(Boolean)
        : [];

      const amenities = data.amenities
        ? data.amenities
            .split(',')
            .map((amenity) => amenity.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        location: data.location.trim(),
        rentAmount: Number(data.rentAmount),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        propertyType: data.propertyType,
        categoryId: data.categoryId,
        status: data.status,
        images,
        amenities,
      };

      await api.post('/landlord/properties', payload);

      toast.success('Property created successfully');

      router.push('/landlord');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Button
        type="button"
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/landlord')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Add New Property
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Luxury Apartment"
                        {...field}
                      />
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
                      <Textarea
                        placeholder="Describe your property..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Sylhet, Bangladesh"
                          {...field}
                        />
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
                      <FormLabel>
                        Monthly Rent (BDT)
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="15000"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="3"
                          {...field}
                        />
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
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="2"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="APARTMENT">
                            Apartment
                          </SelectItem>

                          <SelectItem value="HOUSE">
                            House
                          </SelectItem>

                          <SelectItem value="STUDIO">
                            Studio
                          </SelectItem>

                          <SelectItem value="VILLA">
                            Villa
                          </SelectItem>

                          <SelectItem value="OFFICE">
                            Office
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Availability Status
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="AVAILABLE">
                          Available
                        </SelectItem>

                        <SelectItem value="RENTED">
                          Rented
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs</FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        rows={3}
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Separate multiple image URLs with commas.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="WiFi, Parking, Lift, Security"
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Separate amenities with commas.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {categories.length === 0 && (
                <p className="text-sm text-destructive">
                  No categories are available. A category
                  must exist before creating a property.
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() =>
                    router.push('/landlord')
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    loading || categories.length === 0
                  }
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {loading
                    ? 'Creating...'
                    : 'Create Property'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}