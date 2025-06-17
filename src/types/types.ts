import { Event, Order, OrderItem, Package, Ticket, UserRole } from "@prisma/client";

type OrderItemWithTicketAndPackage = OrderItem & {
  ticket?: Ticket;
  package?: Package;
};

export const publicUserFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true  
} as const;

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Sponsor = {
  id: string;
  sponsor: PublicUser;
};

export type EventWithOrders = Event & {
  organizer: PublicUser;
  tickets: Ticket[];
  packages: Package[];
  sponsors: Sponsor[];
  orders: (Order & {
    orderItems: OrderItemWithTicketAndPackage[];
  })[];
};

export type PublicUserRole = Exclude<UserRole, "ADMIN">;
