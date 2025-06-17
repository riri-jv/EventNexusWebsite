import {
  Event,
  Order,
  OrderItem,
  Package,
  Ticket,
  UserRole,
} from "@prisma/client";

type OrderItemWithTicketAndPackage = OrderItem & {
  ticket?: Ticket;
  package?: Package;
};

export const publicUserFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  imageUrl: true,
} as const;

export const publicEventFields = {
  id: true,
  summary: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  locationURL: true,
  organizerId: true,
  imageId: true,
  image: true,
  sponsors: {
    include: {
      sponsor: true,
    },
  },
  tickets: true,
  packages: true,
  organizer: {
    select: publicUserFields,
  },
} as const;

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
};

type Sponsor = {
  id: string;
  sponsor: PublicUser;
};

export type PublicEvent = Event & {
  organizer: PublicUser;
  tickets: Ticket[];
  packages: Package[];
  sponsors: Sponsor[];
};

export type EventWithOrders = PublicEvent & {
  orders: (Order & {
    orderItems: OrderItemWithTicketAndPackage[];
  })[];
};

export type PublicUserRole = Exclude<UserRole, "ADMIN">;

export type PublicProfile = {
  id: string;
  email: string;
  role: string;
  imageUrl: string;
  firstName: string;
  lastName: string;

  eventsOrganized: PublicEvent[];
  sponsoredEvents: {
    event: PublicEvent;
  }[];
};
