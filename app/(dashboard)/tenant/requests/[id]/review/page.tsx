'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const requestId = params.id as string;
  const propertyId = searchParams.get('propertyId');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!propertyId) {
      toast.error('Property ID not found');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/reviews', {
        propertyId,
        rating,
        comment: comment.trim() || undefined,
      });

      toast.success('Review submitted successfully');

      router.push('/tenant');
      router.refresh();
    } catch (err) {
      let errorMessage = 'Failed to submit review';

      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        errorMessage =
          errorResponse.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/tenant')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>

          <p className="text-sm text-muted-foreground">
            Share your experience with this property.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium">
                Rating
              </label>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 transition-transform hover:scale-110"
                    aria-label={`${value} star rating`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {rating} out of 5
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium"
              >
                Comment
              </label>

              <textarea
                id="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write about your experience..."
                rows={5}
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/tenant')}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || rating === 0 || !propertyId}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>

            {!propertyId && (
              <p className="text-sm text-destructive">
                Property information is missing.
              </p>
            )}

            <input type="hidden" value={requestId} readOnly />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}