"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface RequestToRentButtonProps {
  propertyId: string;
  status: string;
}

export function RequestToRentButton({
  propertyId,
  status,
}: RequestToRentButtonProps) {
  const { user, isLoading } = useAuth();

  if (status !== "AVAILABLE") {
    return (
      <div className="mt-6 rounded-lg bg-muted px-5 py-3 text-center text-sm font-medium">
        This property is currently {status.toLowerCase()}.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-lg bg-muted px-5 py-3 text-center text-sm font-medium text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="mt-6 block rounded-lg bg-primary px-5 py-3 text-center font-medium text-primary-foreground transition hover:opacity-90"
      >
        Login to Request
      </Link>
    );
  }

  if (user.role !== "TENANT") {
    return (
      <div className="mt-6 rounded-lg bg-muted px-5 py-3 text-center text-sm font-medium text-muted-foreground">
        Only tenants can request properties.
      </div>
    );
  }

  return (
    <Link
      href={`/properties/${propertyId}/request`}
      className="mt-6 block rounded-lg bg-primary px-5 py-3 text-center font-medium text-primary-foreground transition hover:opacity-90"
    >
      Request to Rent
    </Link>
  );
}
