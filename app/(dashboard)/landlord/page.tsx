'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Plus, Bed, Bath, Square, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

type Property = {
  id: string;
  title: string;
  location: string;
  rentAmount: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'AVAILABLE' | 'RENTED';
  images: string[];
};

type RentalRequest = {
  id: string;
  propertyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  tenant: {
    name: string;
    email: string;
  };
  property: {
    title: string;
  };
  createdAt: string;
};

export default function LandlordDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propertiesRes, requestsRes] = await Promise.all([
          api.get('/landlord/properties'),
          api.get('/landlord/requests'),
        ]);

        setProperties(propertiesRes.data?.data || []);
        setRequests(requestsRes.data?.data || []);
      } catch (err) {
        let errorMessage = 'Failed to load dashboard data';
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err as { response: { data: { message: string } } };
          errorMessage = errorResponse.response?.data?.message || errorMessage;
        }
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      await api.patch(`/landlord/requests/${requestId}`, { status: 'APPROVED' });
      toast.success('Request approved successfully');
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'APPROVED' } : r));
    } catch (err) {
      let errorMessage = 'Failed to approve request';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response: { data: { message: string } } };
        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.patch(`/landlord/requests/${requestId}`, { status: 'REJECTED' });
      toast.success('Request rejected');
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
    } catch (err) {
      let errorMessage = 'Failed to reject request';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response: { data: { message: string } } };
        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const activeProperties = properties.filter(p => p.status === 'AVAILABLE').length;
  const rentedProperties = properties.filter(p => p.status === 'RENTED').length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
        <Button onClick={() => router.push('/landlord/properties/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
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
            <CardTitle className="text-sm font-medium text-gray-500">Available</CardTitle>
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
              <Button onClick={() => router.push('/landlord/properties/new')} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Beds</TableHead>
                  <TableHead>Baths</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
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
                    <TableCell>৳{Number(property.rentAmount).toLocaleString()}</TableCell>
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
                        className={property.status === 'AVAILABLE' ? 'bg-green-500' : ''}
                      >
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/landlord/properties/${property.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <p>No rental requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.property.title}</TableCell>
                    <TableCell>{request.tenant.name}</TableCell>
                    <TableCell>{request.tenant.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'PENDING'
                            ? 'secondary'
                            : request.status === 'APPROVED'
                            ? 'default'
                            : 'destructive'
                        }
                        className={
                          request.status === 'APPROVED'
                            ? 'bg-green-500'
                            : request.status === 'PENDING'
                            ? 'bg-yellow-500'
                            : ''
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.status === 'PENDING' && (
                        <div className="flex gap-2">
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
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}