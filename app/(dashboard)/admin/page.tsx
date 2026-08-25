'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Calendar, Loader2, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, propertiesRes, requestsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/properties'),
          api.get('/admin/requests'),
        ]);

        setUsers(usersRes.data?.data || []);
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

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isBanned: !isBanned });
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u));
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {users.length}
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
              {properties.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              {requests.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Badge variant={user.isBanned ? 'destructive' : 'default'}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={user.isBanned ? 'outline' : 'destructive'}
                      onClick={() => handleBanUser(user.id, user.isBanned)}
                    >
                      {user.isBanned ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Ban className="h-4 w-4 mr-1" />
                      )}
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}