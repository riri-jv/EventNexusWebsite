export const publicEventFields = {
  id: true,
  createdAt: true,
  updatedAt: true,
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
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

export type PublicEvent = typeof publicEventFields;
