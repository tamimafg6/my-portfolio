export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Address {
  street: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  variantId: string;
  quantity: number;
  unitPrice: number;
  personalization?: Record<string, unknown>;
  createdAt?: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName?: string;
  customerEmail?: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  currency: string;
  deliveryMethod?: "DELIVERY" | "PICKUP";
  pickupDate?: string;
  pickupTimeRange?: string;
  pickupContactEmail?: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  archived?: boolean;
}
