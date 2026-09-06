'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bath,
  Bed,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type RequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED';

type PropertyStatus = 'AVAILABLE' | 'RENTED';

type Property = {
  id: string;
  title: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  images: string[];
  landlordId?: string;
  landlordEmail?: string;
};

type RentalRequest = {
  id: string;
  propertyId: string;
  status: RequestStatus;
  tenant: {
    name: string;
    email: string;
  };
  property: {
    title: string;
    location: string;
    rentAmount: number;
  };
  createdAt: string;
};

function getErrorMessage(error: unknown, fallback: string) {
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

function normalizePropertyStatus(
  status?: unknown,
  isAvailable?: unknown
): PropertyStatus {
  if (status === 'RENTED' || isAvailable === false) {
    return 'RENTED';
  }

  return 'AVAILABLE';
}

function normalizeRequestStatus(status?: unknown): RequestStatus {
  if (
    status === 'APPROVED' ||
    status === 'REJECTED' ||
    status === 'ACTIVE' ||
    status === 'COMPLETED'
  ) {
    return status;
  }

  return 'PENDING';
}

export default function LandlordDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProperties = useCallback(async () => {
    if (!user) {
      return [];
    }

    const response = await api.get('/properties', {
      params: {
        limit: 100,
      },
    });

    const responseData = response.data;

    let rawProperties: Record<string, unknown>[] = [];

    if (Array.isArray(responseData)) {
      rawProperties = responseData;
    } else if (Array.isArray(responseData?.data)) {
      rawProperties = responseData.data;
    } else if (Array.isArray(responseData?.data?.data)) {
      rawProperties = responseData.data.data;
    }

    const formattedProperties = rawProperties.map(
      (property): Property => {
        let landlordId: string | undefined;
        let landlordEmail: string | undefined;

        if (
          property.landlord &&
          typeof property.landlord === 'object'
        ) {
          const landlord = property.landlord as Record<
            string,
            unknown
          >;

          if (typeof landlord.id === 'string') {
            landlordId = landlord.id;
          } else if (typeof landlord._id === 'string') {
            landlordId = landlord._id;
          }

          if (typeof landlord.email === 'string') {
            landlordEmail = landlord.email;
          }
        }

        if (!landlordId && typeof property.landlordId === 'string') {
          landlordId = property.landlordId;
        }

        return {
          id: String(property.id || property._id || ''),
          title: String(property.title || 'Untitled Property'),
          location: String(property.location || 'N/A'),
          rentAmount: Number(property.rentAmount || 0),
          bedrooms: Number(property.bedrooms || 0),
          bathrooms: Number(property.bathrooms || 0),
          status: normalizePropertyStatus(
            property.status,
            property.isAvailable
          ),
          images: Array.isArray(property.images)
            ? (property.images as string[])
            : [],
          landlordId,
          landlordEmail,
        };
      }
    );

    return formattedProperties.filter((property) => {
      if (
        user.id &&
        property.landlordId &&
        property.landlordId === user.id
      ) {
        return true;
      }

      if (
        user.email &&
        property.landlordEmail &&
        property.landlordEmail.toLowerCase() ===
          user.email.toLowerCase()
      ) {
        return true;
      }

      return false;
    });
  }, [user]);

  const fetchRequests = useCallback(async () => {
    const response = await api.get('/landlord/requests');

    const responseData = response.data;

    let rawRequests: Record<string, unknown>[] = [];

    if (Array.isArray(responseData)) {
      rawRequests = responseData;
    } else if (Array.isArray(responseData?.data)) {
      rawRequests = responseData.data;
    } else if (Array.isArray(responseData?.data?.data)) {
      rawRequests = responseData.data.data;
    }

    return rawRequests.map((request): RentalRequest => {
      let propertyId = '';
      let propertyTitle = 'Unknown Property';
      let propertyLocation = '';
      let propertyRent = 0;

      if (
        request.property &&
        typeof request.property === 'object'
      ) {
        const property = request.property as Record<
          string,
          unknown
        >;

        propertyId = String(
          property.id ||
            property._id ||
            request.propertyId ||
            ''
        );

        propertyTitle = String(
          property.title || 'Unknown Property'
        );

        propertyLocation = String(property.location || '');

        propertyRent = Number(property.rentAmount || 0);
      } else {
        propertyId = String(request.propertyId || '');
      }

      let tenantName = 'Unknown Tenant';
      let tenantEmail = 'N/A';

      if (
        request.tenant &&
        typeof request.tenant === 'object'
      ) {
        const tenant = request.tenant as Record<string, unknown>;

        tenantName = String(tenant.name || 'Unknown Tenant');
        tenantEmail = String(tenant.email || 'N/A');
      }

      return {
        id: String(request.id || request._id || ''),
        propertyId,
        status: normalizeRequestStatus(request.status),
        tenant: {
          name: tenantName,
          email: tenantEmail,
        },
        property: {
          title: propertyTitle,
          location: propertyLocation,
          rentAmount: propertyRent,
        },
        createdAt:
          typeof request.createdAt === 'string'
            ? request.createdAt
            : new Date().toISOString(),
      };
    });
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [propertyData, requestData] = await Promise.all([
        fetchProperties(),
        fetchRequests(),
      ]);

      setProperties(propertyData);
      setRequests(requestData);
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Failed to load landlord dashboard'
      );

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    authLoading,
    user,
    fetchProperties,
    fetchRequests,
  ]);

  useEffect(() => {
  const loadDashboard = async () => {
    await fetchDashboardData();
  };

  void loadDashboard();
}, [fetchDashboardData]);

  const handleApprove = async (requestId: string) => {
    const toastId = toast.loading('Approving request...');

    try {
      await api.patch(`/landlord/requests/${requestId}`, {
        status: 'APPROVED',
      });

      toast.success('Request approved successfully', {
        id: toastId,
      });

      await fetchDashboardData();
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Failed to approve request'),
        {
          id: toastId,
        }
      );
    }
  };

  const handleReject = async (requestId: string) => {
    const toastId = toast.loading('Rejecting request...');

    try {
      await api.patch(`/landlord/requests/${requestId}`, {
        status: 'REJECTED',
      });

      toast.success('Request rejected successfully', {
        id: toastId,
      });

      await fetchDashboardData();
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Failed to reject request'),
        {
          id: toastId,
        }
      );
    }
  };

  const handleDeleteProperty = async (
    propertyId: string
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this property?'
    );

    if (!confirmed) {
      return;
    }

    const toastId = toast.loading('Deleting property...');

    try {
      await api.delete(
        `/landlord/properties/${propertyId}`
      );

      setProperties((currentProperties) =>
        currentProperties.filter(
          (property) => property.id !== propertyId
        )
      );

      toast.success('Property deleted successfully', {
        id: toastId,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Failed to delete property'
        ),
        {
          id: toastId,
        }
      );
    }
  };

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  const totalProperties = properties.length;

  const availableProperties = properties.filter(
    (property) => property.status === 'AVAILABLE'
  ).length;

  const rentedProperties = properties.filter(
    (property) => property.status === 'RENTED'
  ).length;

  const pendingRequests = requests.filter(
    (request) => request.status === 'PENDING'
  ).length;

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Landlord Dashboard
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage your rental properties and requests
            </p>
          </div>

          <Loader2 className="h-6 w-6 animate-spin" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-center text-destructive">
              {error}
            </p>

            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Landlord Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your rental properties and applicant requests
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={() =>
              router.push('/landlord/properties/new')
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {totalProperties}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {availableProperties}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rented
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {rentedProperties}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingRequests}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Properties</CardTitle>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              router.push('/landlord/properties/new')
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </CardHeader>

        <CardContent>
          {properties.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Home className="mx-auto mb-4 h-12 w-12 opacity-40" />

              <p className="font-medium">
                No properties listed yet
              </p>

              <p className="mt-1 text-sm">
                Add your first rental property.
              </p>

              <Button
                className="mt-5"
                onClick={() =>
                  router.push(
                    '/landlord/properties/new'
                  )
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Beds</TableHead>
                    <TableHead>Baths</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        {property.title}
                      </TableCell>

                      <TableCell>
                        <span className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                          {property.location}
                        </span>
                      </TableCell>

                      <TableCell>
                        ৳
                        {property.rentAmount.toLocaleString(
                          'en-BD'
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="flex items-center">
                          <Bed className="mr-1 h-4 w-4 text-muted-foreground" />
                          {property.bedrooms}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="flex items-center">
                          <Bath className="mr-1 h-4 w-4 text-muted-foreground" />
                          {property.bathrooms}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            property.status ===
                            'AVAILABLE'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            property.status ===
                            'AVAILABLE'
                              ? 'bg-green-600'
                              : ''
                          }
                        >
                          {property.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              router.push(
                                `/landlord/properties/${property.id}/edit`
                              )
                            }
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              handleDeleteProperty(
                                property.id
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Incoming Rental Requests
          </CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Home className="mx-auto mb-4 h-12 w-12 opacity-40" />

              <p>No rental requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.property.title}
                      </TableCell>

                      <TableCell>
                        {request.tenant.name}
                      </TableCell>

                      <TableCell>
                        {request.tenant.email}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            request.status ===
                            'REJECTED'
                              ? 'destructive'
                              : request.status ===
                                  'PENDING'
                                ? 'secondary'
                                : 'default'
                          }
                          className={
                            request.status ===
                            'APPROVED' ||
                            request.status ===
                            'ACTIVE' ||
                            request.status ===
                            'COMPLETED'
                              ? 'bg-green-600'
                              : request.status ===
                                  'PENDING'
                                ? 'bg-yellow-500 text-white'
                                : ''
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          request.createdAt
                        ).toLocaleDateString(
                          'en-BD'
                        )}
                      </TableCell>

                      <TableCell>
                        {request.status ===
                        'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleApprove(
                                  request.id
                                )
                              }
                            >
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleReject(
                                  request.id
                                )
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="text-right text-sm text-muted-foreground">
                            Handled
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}