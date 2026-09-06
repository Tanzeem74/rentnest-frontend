'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
    .min(1, 'Bedrooms is required')
    .refine(
      (value) =>
        Number.isInteger(Number(value)) &&
        Number(value) >= 0,
      'Bedrooms must be a valid number'
    ),

  bathrooms: z
    .string()
    .min(1, 'Bathrooms is required')
    .refine(
      (value) =>
        Number.isInteger(Number(value)) &&
        Number(value) >= 0,
      'Bathrooms must be a valid number'
    ),

  propertyType: z.enum([
    'APARTMENT',
    'HOUSE',
    'STUDIO',
    'VILLA',
    'OFFICE',
  ]),

  categoryId: z.string().min(1, 'Category is required'),

  status: z.enum(['AVAILABLE', 'RENTED']),

  images: z.string().optional(),

  amenities: z.string().optional(),
});

type PropertyFormValues = z.infer<
  typeof propertySchema
>;

type Category = {
  id: string;
  name: string;
};

function getErrorMessage(
  error: unknown,
  fallback: string
) {
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
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();

  const propertyId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : '';

  const [pageLoading, setPageLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [categories, setCategories] = useState<
    Category[]
  >([]);

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
    if (!propertyId) {
      return;
    }

    let cancelled = false;

    Promise.all([
      api.get(`/properties/${propertyId}`),
      api.get('/categories'),
    ])
      .then(
        ([propertyResponse, categoriesResponse]) => {
          if (cancelled) {
            return;
          }

          const responseData =
            propertyResponse.data;

          const property =
            responseData?.data?.data ??
            responseData?.data ??
            responseData;

          if (!property?.id) {
            toast.error('Property not found');
            router.push('/landlord');
            return;
          }

          const categoryId =
            property.categoryId ||
            property.category?.id ||
            '';

          form.reset({
            title: property.title || '',

            description:
              property.description || '',

            location: property.location || '',

            rentAmount:
              property.rentAmount !== undefined &&
              property.rentAmount !== null
                ? String(property.rentAmount)
                : '',

            bedrooms:
              property.bedrooms !== undefined &&
              property.bedrooms !== null
                ? String(property.bedrooms)
                : '',

            bathrooms:
              property.bathrooms !== undefined &&
              property.bathrooms !== null
                ? String(property.bathrooms)
                : '',

            propertyType:
              property.propertyType ||
              'APARTMENT',

            categoryId,

            status:
              property.status || 'AVAILABLE',

            images: Array.isArray(property.images)
              ? property.images.join(', ')
              : '',

            amenities: Array.isArray(
              property.amenities
            )
              ? property.amenities.join(', ')
              : '',
          });

          const categoryResponseData =
            categoriesResponse.data;

          let categoryData: Category[] = [];

          if (
            Array.isArray(categoryResponseData)
          ) {
            categoryData =
              categoryResponseData;
          } else if (
            Array.isArray(
              categoryResponseData?.data
            )
          ) {
            categoryData =
              categoryResponseData.data;
          } else if (
            Array.isArray(
              categoryResponseData?.data?.data
            )
          ) {
            categoryData =
              categoryResponseData.data.data;
          }

          setCategories(categoryData);
          setPageLoading(false);
        }
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const message = getErrorMessage(
          error,
          'Failed to load property'
        );

        toast.error(message);
        setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [propertyId, form, router]);

  const onSubmit = async (
    data: PropertyFormValues
  ) => {
    if (!propertyId) {
      toast.error('Invalid property ID');
      return;
    }

    try {
      setSubmitting(true);

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

        description:
          data.description.trim(),

        location: data.location.trim(),

        rentAmount: Number(
          data.rentAmount
        ),

        bedrooms: Number(data.bedrooms),

        bathrooms: Number(
          data.bathrooms
        ),

        propertyType:
          data.propertyType,

        categoryId:
          data.categoryId,

        images,

        amenities,

        status: data.status,
      };

      await api.patch(
        `/landlord/properties/${propertyId}`,
        payload
      );

      toast.success(
        'Property updated successfully'
      );

      router.push('/landlord');
      router.refresh();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to update property'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
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
        onClick={() =>
          router.push('/landlord')
        }
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Edit Property
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                onSubmit
              )}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Property Title
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Property title"
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
                    <FormLabel>
                      Description
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Property description"
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
                      <FormLabel>
                        Location
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="Sylhet"
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
                      <FormLabel>
                        Bedrooms
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
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
                      <FormLabel>
                        Bathrooms
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
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
                      <FormLabel>
                        Property Type
                      </FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={
                          field.onChange
                        }
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
                      <FormLabel>
                        Category
                      </FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={
                          field.onChange
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {categories.map(
                            (category) => (
                              <SelectItem
                                key={
                                  category.id
                                }
                                value={
                                  category.id
                                }
                              >
                                {
                                  category.name
                                }
                              </SelectItem>
                            )
                          )}
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
                      value={field.value}
                      onValueChange={
                        field.onChange
                      }
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
                    <FormLabel>
                      Image URLs
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Separate multiple image
                      URLs with commas.
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
                    <FormLabel>
                      Amenities
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Wifi, Parking, Lift"
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Separate amenities with
                      commas.
                    </p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() =>
                    router.push(
                      '/landlord'
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {submitting
                    ? 'Updating...'
                    : 'Update Property'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}