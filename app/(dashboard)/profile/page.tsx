"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface PropertyItem {
  id: string;
  landlord?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface ReviewItem {
  id: string;
  propertyId: string;
  property?: {
    id: string;
  };
}

interface PublicReview {
  id: string;
  tenant?: {
    id: string;
    name: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [profileName, setProfileName] = useState("");
  const [nameLoading, setNameLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadName = async () => {
      try {
        if (user.name && user.name !== "User") {
          setProfileName(user.name);
          return;
        }

        if (user.role === "LANDLORD") {
          const response = await api.get("/properties", {
            params: {
              limit: 100,
            },
          });

          const responseData = response.data;

          let properties: PropertyItem[] = [];

          if (Array.isArray(responseData)) {
            properties = responseData;
          } else if (Array.isArray(responseData?.data)) {
            properties = responseData.data;
          } else if (Array.isArray(responseData?.data?.data)) {
            properties = responseData.data.data;
          }

          const ownProperty = properties.find(
            (property) =>
              property.landlord?.id === user.id ||
              property.landlord?.email?.toLowerCase() ===
                user.email.toLowerCase(),
          );

          if (ownProperty?.landlord?.name) {
            setProfileName(ownProperty.landlord.name);
            return;
          }
        }

        if (user.role === "ADMIN") {
          const response = await api.get("/admin/users");

          const responseData = response.data;

          let users: AdminUser[] = [];

          if (Array.isArray(responseData)) {
            users = responseData;
          } else if (Array.isArray(responseData?.data)) {
            users = responseData.data;
          } else if (Array.isArray(responseData?.data?.data)) {
            users = responseData.data.data;
          }

          const currentUser = users.find(
            (item) =>
              item.id === user.id ||
              item.email.toLowerCase() === user.email.toLowerCase(),
          );

          if (currentUser?.name) {
            setProfileName(currentUser.name);
            return;
          }
        }

        if (user.role === "TENANT") {
          const myReviewsResponse = await api.get("/reviews/my");

          const responseData = myReviewsResponse.data;

          let myReviews: ReviewItem[] = [];

          if (Array.isArray(responseData)) {
            myReviews = responseData;
          } else if (Array.isArray(responseData?.data)) {
            myReviews = responseData.data;
          } else if (Array.isArray(responseData?.data?.data)) {
            myReviews = responseData.data.data;
          }

          if (myReviews.length > 0) {
            const propertyId =
              myReviews[0].propertyId || myReviews[0].property?.id;

            if (propertyId) {
              const reviewsResponse = await api.get(
                `/reviews/property/${propertyId}`,
              );

              const reviewsResponseData = reviewsResponse.data;

              let propertyReviews: PublicReview[] = [];

              if (Array.isArray(reviewsResponseData)) {
                propertyReviews = reviewsResponseData;
              } else if (Array.isArray(reviewsResponseData?.data)) {
                propertyReviews = reviewsResponseData.data;
              } else if (Array.isArray(reviewsResponseData?.data?.data)) {
                propertyReviews = reviewsResponseData.data.data;
              }

              const ownReview = propertyReviews.find(
                (review) => review.tenant?.id === user.id,
              );

              if (ownReview?.tenant?.name) {
                setProfileName(ownReview.tenant.name);
                return;
              }
            }
          }
        }

        setProfileName("User");
      } catch (error) {
        console.error("Failed to load profile name:", error);
        setProfileName(user.name || "User");
      } finally {
        setNameLoading(false);
      }
    };

    loadName();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dashboardPath = `/${user.role.toLowerCase()}`;

  const displayName = nameLoading
    ? "Loading..."
    : profileName || user.name || "User";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <button
          onClick={() => router.push(dashboardPath)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

          <p className="mt-2 text-muted-foreground">
            Your RentNest account information.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b bg-primary/5 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <UserRound className="h-10 w-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">{displayName}</h2>

                <p className="mt-1 text-muted-foreground">{user.email}</p>

                <Badge className="mt-3">{user.role}</Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8">
            <h3 className="mb-5 text-lg font-semibold">Account Information</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Full Name</p>

                  <p className="truncate font-semibold">{displayName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Email Address</p>

                  <p className="truncate font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Account Role</p>

                  <p className="font-semibold">{user.role}</p>
                </div>
              </div>

              <button
                onClick={() => router.push(dashboardPath)}
                className="flex items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Dashboard</p>

                  <p className="font-semibold">
                    Go to {user.role.toLowerCase()} dashboard
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
