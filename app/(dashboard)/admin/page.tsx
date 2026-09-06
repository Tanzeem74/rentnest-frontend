"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Home,
  Calendar,
  Ban,
  CheckCircle,
  Loader2,
  Building2,
  UserRound,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "BLOCKED";
  createdAt: string;
};

type Property = {
  id: string;
  title: string;
  status: string;
  location?: string;
  rentAmount?: string | number;
  landlord: {
    id?: string;
    name: string;
    email?: string;
  };
};

type RentalRequest = {
  id: string;
  status: string;
  createdAt?: string;
  tenant: {
    id?: string;
    name: string;
    email?: string;
  };
  property: {
    id?: string;
    title: string;
    location?: string;
  };
};

type DashboardStats = {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  totalRentalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  activeRentals: number;
  completedPayments: number;
  totalRevenue: number | string;
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/admin/users"),
      api.get("/admin/properties"),
      api.get("/admin/rentals"),
      api.get("/admin/dashboard"),
    ])
      .then(([usersRes, propertiesRes, requestsRes, statsRes]) => {
        const usersData = Array.isArray(usersRes.data?.data)
          ? usersRes.data.data
          : [];

        const propertiesData = Array.isArray(propertiesRes.data?.data)
          ? propertiesRes.data.data
          : [];

        const requestsData = Array.isArray(requestsRes.data?.data)
          ? requestsRes.data.data
          : [];

        setUsers(usersData);
        setProperties(propertiesData);
        setRequests(requestsData);
        setStats(statsRes.data?.data || null);
      })
      .catch((err) => {
        let errorMessage = "Failed to load admin data";

        if (err && typeof err === "object" && "response" in err) {
          const errorResponse = err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          errorMessage = errorResponse.response?.data?.message || errorMessage;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const handleBanUser = async (
    userId: string,
    currentStatus: "ACTIVE" | "BLOCKED",
  ) => {
    const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    try {
      await api.patch(`/admin/users/${userId}`, {
        status: newStatus,
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? {
                ...currentUser,
                status: newStatus,
              }
            : currentUser,
        ),
      );

      toast.success(
        newStatus === "BLOCKED"
          ? "User banned successfully"
          : "User unbanned successfully",
      );
    } catch (err) {
      let errorMessage = "Failed to update user";

      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    }
  };

  const getRentalBadge = (status: string) => {
    if (status === "PENDING") {
      return <Badge variant="secondary">Pending</Badge>;
    }

    if (status === "REJECTED") {
      return <Badge variant="destructive">Rejected</Badge>;
    }

    if (status === "COMPLETED") {
      return <Badge variant="outline">Completed</Badge>;
    }

    return <Badge>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <Loader2 className="h-6 w-6 animate-spin" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg" />
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <p className="text-sm text-gray-500">
            Welcome back, {user?.name || "Admin"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Users
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />

              <p className="text-2xl font-bold">
                {stats?.totalUsers ?? users.length}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {stats?.totalTenants ?? 0} tenants · {stats?.totalLandlords ?? 0}{" "}
              landlords
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Properties
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-green-500" />

              <p className="text-2xl font-bold">
                {stats?.totalProperties ?? properties.length}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {stats?.availableProperties ?? 0} available ·{" "}
              {stats?.rentedProperties ?? 0} rented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Rental Requests
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />

              <p className="text-2xl font-bold">
                {stats?.totalRentalRequests ?? requests.length}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {stats?.pendingRequests ?? 0} pending ·{" "}
              {stats?.activeRentals ?? 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-500" />

              <p className="text-2xl font-bold">
                ৳{Number(stats?.totalRevenue || 0).toLocaleString("en-BD")}
              </p>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {stats?.completedPayments ?? 0} completed payments
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        {account.name}
                      </TableCell>

                      <TableCell>{account.email}</TableCell>

                      <TableCell>
                        <Badge variant="outline">{account.role}</Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            account.status === "BLOCKED"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {account.status === "BLOCKED" ? "Banned" : "Active"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {account.createdAt
                          ? new Date(account.createdAt).toLocaleDateString(
                              "en-BD",
                            )
                          : "N/A"}
                      </TableCell>

                      <TableCell>
                        {account.id === user?.id ? (
                          <span className="text-sm text-gray-400">
                            Current Admin
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={
                              account.status === "BLOCKED"
                                ? "outline"
                                : "destructive"
                            }
                            onClick={() =>
                              handleBanUser(account.id, account.status)
                            }
                          >
                            {account.status === "BLOCKED" ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Ban
                              </>
                            )}
                          </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Property Management</CardTitle>
        </CardHeader>

        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />

              <p>No properties found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        {property.title}
                      </TableCell>

                      <TableCell>{property.landlord?.name || "N/A"}</TableCell>

                      <TableCell>{property.location || "N/A"}</TableCell>

                      <TableCell>
                        {property.rentAmount
                          ? `৳${Number(property.rentAmount).toLocaleString(
                              "en-BD",
                            )}`
                          : "N/A"}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            property.status === "RENTED"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {property.status}
                        </Badge>
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
          <CardTitle>Rental Management</CardTitle>
        </CardHeader>

        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserRound className="h-12 w-12 mx-auto mb-4 text-gray-300" />

              <p>No rental requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.tenant?.name || "N/A"}
                      </TableCell>

                      <TableCell>{request.property?.title || "N/A"}</TableCell>

                      <TableCell>{getRentalBadge(request.status)}</TableCell>

                      <TableCell>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleDateString(
                              "en-BD",
                            )
                          : "N/A"}
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
