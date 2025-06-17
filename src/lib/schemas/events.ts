import { z } from "zod";

export const eventOverviewSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(1, "Event summary cannot be empty")
    .max(80, "Event summary is too long"),
  description: z
    .string()
    .trim()
    .max(800, "Event description cannot exceed 800 chars"),
});

export const eventLogisticsSchema = z.object({
  startTime: z.coerce.date({ invalid_type_error: "Invalid date-time format" }),
  endTime: z.coerce.date({ invalid_type_error: "Invalid date-time format" }),
  location: z
    .string()
    .trim()
    .min(1, "Location cannot be empty")
    .max(200, "Location cannot exceed 200 chars"),
  locationURL: z.string().url("Invalid location url"),
});

export const ticketSchema = z.object({
  title: z.string().trim().min(1, "Ticket title is required"),
  description: z
    .string()
    .trim()
    .max(100, "Ticket description cannot exceed 100 chars"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
});

export const packageSchema = z.object({
  title: z.string().trim().min(1, "Package title is required"),
  description: z
    .string()
    .trim()
    .min(1, "Package description cannot be empty")
    .max(800, "Package description cannot exceed 800 chars"),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative integer"),
});

export const eventSchema = eventOverviewSchema
  .merge(eventLogisticsSchema)
  .extend({
    tickets: z.array(ticketSchema),
    packages: z.array(packageSchema),
    image: z.string(),
  });
