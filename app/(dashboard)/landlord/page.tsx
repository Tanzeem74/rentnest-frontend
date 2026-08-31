'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Plus, Bed, Bath, Loader2, MapPin, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
type PropertyStatus = 'AVAILABLE' | 'RENTED';

type Property = {
  id: string;
  title: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  images?: string[];
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

type AuthUser = {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
};

function normalizeStatus(status?: string): RequestStatus {
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

function normalizePropertyStatus(isAvailable?: boolean, status?: string): PropertyStatus {
  if (isAvailable === false || status === 'RENTED') {
    return 'RENTED';
  }
  return 'AVAILABLE';
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = err as { response?: { data?: { message?: string; error?: string } } };
    return res.response?.data?.message || res.response?.data?.error || fallback;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export default function LandlordDashboard() {
  const { user } = useAuth() as { user: AuthUser | null };
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    const currentUserId = user?.id || user?._id;
    const currentUserEmail = user?.email;

    try {
      const propertiesRes = await api.get('/properties');
      const resData = propertiesRes.data as Record<string, unknown>;

      let rawProps: Record<string, unknown>[] = [];
      if (Array.isArray(resData)) {
        rawProps = resData as Record<string, unknown>[];
      } else if (Array.isArray(resData?.data)) {
        rawProps = resData.data as Record<string, unknown>[];
      } else if (resData?.data && typeof resData.data === 'object' && Array.isArray((resData.data as Record<string, unknown>).data)) {
        rawProps = (resData.data as Record<string, unknown>).data as Record<string, unknown>[];
      } else if (Array.isArray(resData?.properties)) {
        rawProps = resData.properties as Record<string, unknown>[];
      }

      const formattedProps: Property[] = rawProps
        .map((p): Property => {
          let landlordIdVal: string | undefined;
          let landlordEmailVal: string | undefined;

          if (typeof p.landlord === 'object' && p.landlord !== null) {
            const lObj = p.landlord as Record<string, unknown>;
            landlordIdVal = String(lObj._id || lObj.id || '');
            landlordEmailVal = typeof lObj.email === 'string' ? lObj.email : undefined;
          } else if (typeof p.landlordId === 'string') {
            landlordIdVal = p.landlordId;
          } else if (typeof p.landlord === 'string') {
            landlordIdVal = p.landlord;
          }

          const propStatus: PropertyStatus = normalizePropertyStatus(
            typeof p.isAvailable === 'boolean' ? p.isAvailable : undefined,
            typeof p.status === 'string' ? p.status : undefined
          );

          return {
            id: String(p.id || p._id || ''),
            title: String(p.title || 'Untitled'),
            location: String(p.location || 'N/A'),
            rentAmount: Number(p.rentAmount || p.rent || 0),
            bedrooms: Number(p.bedrooms || 0),
            bathrooms: Number(p.bathrooms || 0),
            status: propStatus,
            images: Array.isArray(p.images) ? (p.images as string[]) : [],
            landlordId: landlordIdVal,
            landlordEmail: landlordEmailVal,
          };
        })
        .filter((p) => {
          if (currentUserId && p.landlordId) {
            return p.landlordId === currentUserId;
          }
          if (currentUserEmail && p.landlordEmail) {
            return p.landlordEmail === currentUserEmail;
          }
          return true;
        });

      let formattedRequests: RentalRequest[] = [];

      try {
        const requestsRes = await api.get('/landlord/requests');
        const reqData = requestsRes.data as Record<string, unknown>;

        let rawRequests: Record<string, unknown>[] = [];
        if (Array.isArray(reqData)) {
          rawRequests = reqData as Record<string, unknown>[];
        } else if (Array.isArray(reqData?.data)) {
          rawRequests = reqData.data as Record<string, unknown>[];
        } else if (Array.isArray(reqData?.requests)) {
          rawRequests = reqData.requests as Record<string, unknown>[];
        }

        formattedRequests = rawRequests.map((r): RentalRequest => {
          let propId = String(r.propertyId || '');
          let propTitle = 'Unknown Property';
          let propLocation = '';
          let propRent = 0;

          if (typeof r.property === 'object' && r.property !== null) {
            const pObj = r.property as Record<string, unknown>;
            propId = String(pObj._id || pObj.id || propId);
            propTitle = String(pObj.title || propTitle);
            propLocation = String(pObj.location || '');
            propRent = Number(pObj.rentAmount || 0);
          } else if (typeof r.property === 'string') {
            propId = r.property;
          }

          let tenantName = 'Unknown';
          let tenantEmail = 'Unknown';

          if (typeof r.tenant === 'object' && r.tenant !== null) {
            const tObj = r.tenant as Record<string, unknown>;
            tenantName = String(tObj.name || tenantName);
            tenantEmail = String(tObj.email || tenantEmail);
          } else {
            tenantName = String(r.userName || tenantName);
            tenantEmail = String(r.userEmail || tenantEmail);
          }

          return {
            id: String(r.id || r._id || ''),
            propertyId: propId,
            status: normalizeStatus(typeof r.status === 'string' ? r.status : undefined),
            tenant: {
              name: tenantName,
              email: tenantEmail,
            },
            property: {
              title: propTitle,
              location: propLocation,
              rentAmount: propRent,
            },
            createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
          };
        });
      } catch {
        formattedRequests = [];
      }

      setProperties(formattedProps);
      setRequests(formattedRequests);
      setError('');
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to load dashboard data');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;

    const executeFetch = async () => {
      if (!ignore) {
        await fetchData();
      }
    };

    executeFetch();

    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const handleApprove = async (requestId: string) => {
    const toastId = toast.loading('Approving request...');
    try {
      await api.patch(`/landlord/requests/${requestId}`, { status: 'APPROVED' });
      toast.success('Request approved successfully', { id: toastId });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
      );
    } catch (err) {
      try {
        await api.patch(`/rentals/${requestId}`, { status: 'APPROVED' });
        toast.success('Request approved successfully', { id: toastId });
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
        );
      } catch (fallbackErr) {
        const errorMessage = getErrorMessage(fallbackErr, 'Failed to approve request');
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  const handleReject = async (requestId: string) => {
    const toastId = toast.loading('Rejecting request...');
    try {
      await api.patch(`/landlord/requests/${requestId}`, { status: 'REJECTED' });
      toast.success('Request rejected successfully', { id: toastId });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
      );
    } catch (err) {
      try {
        await api.patch(`/rentals/${requestId}`, { status: 'REJECTED' });
        toast.success('Request rejected successfully', { id: toastId });
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: 'REJECTED' } : r))
        );
      } catch (fallbackErr) {
        const errorMessage = getErrorMessage(fallbackErr, 'Failed to reject request');
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const toastId = toast.loading('Deleting property...');
    try {
      await api.delete(`/landlord/properties/${propertyId}`);
      toast.success('Property deleted successfully', { id: toastId });
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (err) {
      try {
        await api.delete(`/properties/${propertyId}`);
        toast.success('Property deleted successfully', { id: toastId });
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      } catch (fallbackErr) {
        const errorMessage = getErrorMessage(fallbackErr, 'Failed to delete property. It may have active rental requests or bookings.');
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  const activeProperties = properties.filter((p) => p.status === 'AVAILABLE').length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your rental properties and applicant requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/landlord/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{properties.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Available Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeProperties}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No properties listed yet</p>
              <Button
                onClick={() => router.push('/landlord/properties/new')}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {property.location}
                        </span>
                      </TableCell>
                      <TableCell>${property.rentAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Bed className="h-3 w-3 mr-1 text-gray-400" />
                          {property.bedrooms}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Bath className="h-3 w-3 mr-1 text-gray-400" />
                          {property.bathrooms}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={property.status === 'AVAILABLE' ? 'default' : 'secondary'}
                          className={property.status === 'AVAILABLE' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                        //   onClick={() => router.push(`/landlord/properties/${property.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
          <CardTitle>Incoming Rental Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.property.title}
                      </TableCell>
                      <TableCell>{request.tenant.name}</TableCell>
                      <TableCell>{request.tenant.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === 'PENDING'
                              ? 'secondary'
                              : request.status === 'APPROVED' || request.status === 'ACTIVE'
                              ? 'default'
                              : 'destructive'
                          }
                          className={
                            request.status === 'APPROVED' || request.status === 'ACTIVE'
                              ? 'bg-green-500 hover:bg-green-600'
                              : request.status === 'PENDING'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : ''
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Handled</span>
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