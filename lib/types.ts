export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';

export type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isBanned?: boolean;
    createdAt?: string;
};

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    user: User;
};

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterData = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
};

export type Property = {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    category: { id: string; name: string };
    landlord: User;
    images: string[];
    status: 'AVAILABLE' | 'RENTED';
    amenities: string[];
    createdAt: string;
};

export type RentalRequest = {
    id: string;
    propertyId: string;
    tenantId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
    message?: string;
    property: Property;
    tenant: User;
    createdAt: string;
    updatedAt: string;
};

export type Payment = {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED';
    rentalRequestId: string;
    transactionId?: string;
    createdAt: string;
};
export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};