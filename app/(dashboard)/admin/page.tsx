'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Calendar, Ban, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned?: boolean;
  status?: string;
  createdAt: string;
};

type Property = {
  id: string;
  title: string;
  status: string;
  landlord: { name: string };
};

type RentalRequest = {
  id: string;
  status: string;
  tenant: { name: string };
  property: { title: string };
};

type DashboardStats = {
  totalUsers: number;
  totalProperties: number;
  totalRentals: number;
  pendingRentals: number;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [usersRes, propertiesRes, requestsRes, statsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/properties'),
          api.get('/admin/rentals'),
          api.get('/admin/dashboard'),
        ]);

        setUsers(usersRes.data?.data || []);
        setProperties(propertiesRes.data?.data || []);
        setRequests(requestsRes.data?.data || []);
        setStats(statsRes.data?.data || null);

      } catch (err) {
        let errorMessage = 'Failed to load admin data';
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err as { response: { data: { message: string } } };
          errorMessage = errorResponse.response?.data?.message || errorMessage;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus, isBanned: newStatus === 'BLOCKED' } : u));
      toast.success(`User ${newStatus === 'BLOCKED' ? 'banned' : 'unbanned'} successfully`);
    } catch (err) {
      let errorMessage = 'Failed to update user';
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
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || users.length;
  const totalProperties = stats?.totalProperties || properties.length;
  const totalRentals = stats?.totalRentals || requests.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Home className="h-5 w-5 text-green-500" />
              {totalProperties}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              {totalRentals}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {stats?.pendingRentals || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'BLOCKED' || user.isBanned ? 'destructive' : 'default'}>
                        {user.status === 'BLOCKED' || user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={user.status === 'BLOCKED' || user.isBanned ? 'outline' : 'destructive'}
                        onClick={() => handleBanUser(user.id, user.status || 'ACTIVE')}
                      >
                        {user.status === 'BLOCKED' || user.isBanned ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <Ban className="h-4 w-4 mr-1" />
                        )}
                        {user.status === 'BLOCKED' || user.isBanned ? 'Unban' : 'Ban'}
                      </Button>
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