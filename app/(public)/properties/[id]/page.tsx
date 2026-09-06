import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  Folder,
  MapPin,
  Star,
  User,
} from "lucide-react";
import { RequestToRentButton } from "@/components/properties/RequestToRentButton";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  rentAmount: string;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  status: string;
  images: string[];
  amenities: string[];
  landlordId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
  };
}

interface Review {
  id: string;
  propertyId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  tenant: {
    id: string;
    name: string;
    profilePhoto: string | null;
  };
}

interface PropertyDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProperty(id: string): Promise<Property> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/properties/${id}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch property");
  }

  const result = await response.json();

  return result.data;
}

async function getReviews(propertyId: string): Promise<Review[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reviews/property/${propertyId}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    if (Array.isArray(result?.data?.data)) {
      return result.data.data;
    }

    return [];
  } catch {
    return [];
  }
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;

  const [property, reviews] = await Promise.all([
    getProperty(id),
    getReviews(id),
  ]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length
      : 0;

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>

        {property.images?.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {property.images.map((image, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border bg-muted"
              >
                <Image
                  src={image}
                  alt={`${property.title} image ${index + 1}`}
                  width={800}
                  height={500}
                  className="h-72 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <div className="rounded-xl border bg-background p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {property.category?.name}
                  </p>

                  <h1 className="mt-1 text-3xl font-bold">{property.title}</h1>

                  <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </p>

                  {reviews.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />

                      <span className="font-semibold">
                        {averageRating.toFixed(1)}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        ({reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>

                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {property.status}
                </span>
              </div>

              <div className="mt-8">
                <p className="text-sm text-muted-foreground">Monthly Rent</p>

                <p className="text-3xl font-bold">
                  ৳{Number(property.rentAmount).toLocaleString("en-BD")}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <BedDouble className="h-5 w-5 text-primary" />

                  <p className="mt-2 text-sm text-muted-foreground">Bedrooms</p>

                  <p className="font-semibold">{property.bedrooms}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <Bath className="h-5 w-5 text-primary" />

                  <p className="mt-2 text-sm text-muted-foreground">
                    Bathrooms
                  </p>

                  <p className="font-semibold">{property.bathrooms}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <Building2 className="h-5 w-5 text-primary" />

                  <p className="mt-2 text-sm text-muted-foreground">Type</p>

                  <p className="font-semibold">{property.propertyType}</p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <Folder className="h-5 w-5 text-primary" />

                  <p className="mt-2 text-sm text-muted-foreground">Category</p>

                  <p className="font-semibold">{property.category?.name}</p>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-semibold">About this property</h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  {property.description}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-xl font-semibold">Amenities</h2>

                {property.amenities?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No amenities listed.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Reviews</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Reviews from tenants who rented this property
                  </p>
                </div>

                {reviews.length > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />

                    <div>
                      <p className="text-xl font-bold">
                        {averageRating.toFixed(1)}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {reviews.length}{" "}
                        {reviews.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="py-10 text-center">
                  <Star className="mx-auto h-10 w-10 text-muted-foreground/30" />

                  <p className="mt-3 text-sm text-muted-foreground">
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {review.tenant?.profilePhoto ? (
                            <Image
                              src={review.tenant.profilePhoto}
                              alt={review.tenant.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}

                          <div>
                            <p className="font-medium">
                              {review.tenant?.name || "Tenant"}
                            </p>

                            <div className="mt-1 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Star
                                  key={value}
                                  className={`h-4 w-4 ${
                                    value <= Number(review.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString(
                                "en-BD",
                              )
                            : ""}
                        </span>
                      </div>

                      {review.comment ? (
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="mt-4 text-sm italic text-muted-foreground">
                          No comment provided.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-xl border bg-background p-6">
            <h2 className="text-xl font-semibold">Property Owner</h2>

            <div className="mt-5 flex items-center gap-4">
              {property.landlord?.profilePhoto ? (
                <Image
                  src={property.landlord.profilePhoto}
                  alt={property.landlord.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}

              <div className="min-w-0">
                <p className="font-semibold">{property.landlord?.name}</p>

                <p className="truncate text-sm text-muted-foreground">
                  {property.landlord?.email}
                </p>
              </div>
            </div>

            <RequestToRentButton
              propertyId={property.id}
              status={property.status}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
