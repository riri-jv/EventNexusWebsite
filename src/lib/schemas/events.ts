import { z } from "zod";

export const eventOverviewSchema = z.object({
    summary: z.string().trim().min(1, "Event summary cannot be empty").max(80, "Event summary is too long"),
    description: z.string().trim().max(800, "Event description cannot exceed 800 chars"),
});

export const eventLogisticsSchema = z.object({
    startTime: z.coerce.date({ invalid_type_error: "Invalid date-time format" }),
    endTime: z.coerce.date({ invalid_type_error: "Invalid date-time format" }),
    location: z.string().trim().min(1, "Location cannot be empty").max(200, "Location cannot exceed 200 chars"),
    locationURL: z.string().url("Invalid location url"),
});

export const ticketTypeSchema = z.object({
    name: z.string().trim().min(1, "Ticket name is required"),
    price: z.coerce.number().nonnegative("Price must be non-negative"),
    currency: z.string().trim().min(1, "Currency is required"),
    quantity: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer"),
});

export const sponsorshipTypeSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    benefits: z.string().trim().min(1, "Benefit cannot be empty").max(800, "Benefits cannot execeed 800 chars"),
    price: z.coerce.number().nonnegative("Price must be non-negative"),
    currency: z.string().trim().min(1, "Currency is required"),
});
