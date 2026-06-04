
export type UserRole = 'admin' | 'manager' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  permissions?: string[]; // Optional: list of tab IDs they can access
}

export type OrderType = 'Normal' | 'Urgent';
export type OrderStatus = 'Received' | 'Washing' | 'Ironing' | 'Ready' | 'Delivered';
export type PaymentMethod = 'Cash' | 'Card' | 'Transfer' | 'Subscription' | 'Free';

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  service_type?: 'عادي' | 'مستعجل';
  is_ironing_only?: boolean;
  ironing_type?: 'غسيل وكوي' | 'كوي فقط' | 'بدون كوي';
  price_normal?: number;
  price_urgent?: number;
  price_ironing?: number;
  price_no_ironing?: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  items: LaundryItem[];
  subtotal: number;
  tax: number;
  total: number;
  custom_adjustment: number;
  is_paid: boolean;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  // Notification tracking
  notified_1h?: boolean;
  notified_24h?: boolean;
  notified_48h?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  threshold: number;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  total_items: number;
  price: number;
  duration_days: number;
}

export interface Subscription {
  id: string;
  customer_name: string;
  customer_phone: string;
  package_id: string;
  items_remaining: number;
  total_items: number;
  expiry_date: string;
  is_active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percent?: number;
  free_items?: number;
  threshold_items?: number;
  expiry_date?: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  enabled: boolean;
}
