"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function RentalRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [requestedMoveInDate, setRequestedMoveInDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "TENANT") {
      router.replace(`/properties/${params.id}`);
    }
  }, [user, isLoading, router, params.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestedMoveInDate) {
      toast.error("Please select a move-in date");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/rentals", {
        propertyId: params.id,
        requestedMoveInDate,
      });

      toast.success("Rental request submitted successfully");
      router.push("/tenant");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to submit rental request",
        );
      } else {
        toast.error("Failed to submit rental request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user || user.role !== "TENANT") {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-muted/20 py-10">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <Link
          href={`/properties/${params.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>

        <div className="rounded-xl border bg-background p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Request to Rent</h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Select your preferred move-in date and submit your rental request.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="moveInDate"
                className="mb-2 block text-sm font-medium"
              >
                Preferred Move-in Date
              </label>

              <input
                id="moveInDate"
                type="date"
                min={today}
                value={requestedMoveInDate}
                onChange={(event) => setRequestedMoveInDate(event.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-3 outline-none transition focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Rental Request"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
