'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Home, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

type RentalRequest = {
  id: string;
  propertyId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  message?: string;
  requestedMoveInDate?: string;
  property: {
    id: string;
    title: string;
    location: string;
    rentAmount: string;
    images: string[];
  };
  createdAt: string;
  updatedAt: string;
};

type Payment = {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  rentalRequestId: string;
  transactionId?: string;
  createdAt: string;
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    completed: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsRes, paymentsRes] = await Promise.all([
          api.get('/rentals'),
          api.get('/payments'),
        ]);

        const requestsData = requestsRes.data?.data || [];
        const paymentsData = paymentsRes.data?.data || [];

        setRequests(requestsData);
        setPayments(paymentsData);

        const pending = requestsData.filter((r: RentalRequest) => r.status === 'PENDING').length;
        const approved = requestsData.filter((r: RentalRequest) => r.status === 'APPROVED').length;
        const active = requestsData.filter((r: RentalRequest) => r.status === 'ACTIVE').length;
        const completed = requestsData.filter((r: RentalRequest) => r.status === 'COMPLETED').length;

        setStats({
          total: requestsData.length,
          pending,
          approved,
          active,
          completed,
        });
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      ACTIVE: { variant: 'default', label: 'Active' },
      COMPLETED: { variant: 'outline', label: 'Completed' },
    };
    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handlePayNow = (requestId: string) => {
    router.push(`/tenant/requests/${requestId}/pay`);
  };

  const handleLeaveReview = (requestId: string, propertyId: string) => {
    router.push(`/tenant/requests/${requestId}/review?propertyId=${propertyId}`);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <Button onClick={() => router.push('/properties')}>
          <Plus className="h-4 w-4 mr-2" />
          Browse Properties
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rental Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No rental requests yet</p>
              <Button onClick={() => router.push('/properties')} variant="outline" className="mt-4">
                Browse Properties
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
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.property.title}</TableCell>
                      <TableCell>{request.property.location}</TableCell>
                      <TableCell>৳{Number(request.property.rentAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          {getStatusBadge(request.status)}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {request.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(request.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          {request.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLeaveReview(request.id, request.propertyId)}
                            >
                              Leave Review
                            </Button>
                          )}
                          {request.status === 'PENDING' && (
                            <span className="text-sm text-gray-400">Waiting for approval</span>
                          )}
                          {request.status === 'REJECTED' && (
                            <span className="text-sm text-red-500">Rejected</span>
                          )}
                          {request.status === 'ACTIVE' && (
                            <span className="text-sm text-green-600">Active rental</span>
                          )}
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

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.transactionId || 'N/A'}</TableCell>
                      <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'PAID'
                              ? 'default'
                              : payment.status === 'PENDING'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}