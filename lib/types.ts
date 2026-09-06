export type UserRole = 'TENANT' | 'LANDLORD' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'STUDIO'
  | 'VILLA'
  | 'OFFICE';

export type PropertyStatus = 'AVAILABLE' | 'RENTED';
export type RentalRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED';

export type PaymentProvider = 'STRIPE' | 'SSLCOMMERZ';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string | null;
  profilePhoto?: string | null;
  createdAt?: string;
  updatedAt?: string;
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

export type Category = {
  id: string;
  name: string;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  images: string[];
  amenities: string[];
  landlordId?: string;
  categoryId?: string;
  category: Category;
  landlord: User;
  createdAt: string;
  updatedAt?: string;
};

export type RentalRequest = {
  id: string;
  propertyId: string;
  tenantId: string;
  requestedMoveInDate: string;
  status: RentalRequestStatus;
  property: Property;
  tenant: User;
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  transactionId: string;
  rentalRequestId: string;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};