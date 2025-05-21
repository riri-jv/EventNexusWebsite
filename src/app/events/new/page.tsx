"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventOverviewSchema,
  eventLogisticsSchema,
  ticketTypeSchema,
  sponsorshipTypeSchema,
} from "@/lib/schemas/events";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

// Dynamically import the map to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const formSchema = z.object({
  ...eventOverviewSchema.shape,
  ...eventLogisticsSchema.shape,
  ticketTypes: z.array(ticketTypeSchema),
  sponsorshipTypes: z.array(sponsorshipTypeSchema),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [locationURL, setLocationURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoaded && user && user.publicMetadata.role !== 'organizer' && user.publicMetadata.role !== 'admin') {
    router.push('/events');
    return null;
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketTypes: [{ name: "", price: 0, currency: "INR", quantity: 0 }],
      sponsorshipTypes: [{ name: "", benefits: "", price: 0, currency: "INR" }],
    },
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({ control, name: "ticketTypes" });

  const {
    fields: sponsorFields,
    append: appendSponsor,
    remove: removeSponsor,
  } = useFieldArray({ control, name: "sponsorshipTypes" });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('Event created successfully!');
        router.push(`/events/${result.eventId}`);
      } else {
        toast.error(result.message || 'Failed to create event');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Event Overview</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Event Image</label>
            <ImageUpload
              value={watch("image")}
              onChange={(url) => setValue("image", url)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Summary</label>
            <Input
              {...register("summary")}
              className="w-full"
              placeholder="Enter event summary"
            />
            {errors.summary && (
              <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <textarea
              {...register("description")}
              className="w-full h-32 rounded-md border resize-none focus:ring-2 focus:ring-blue-500 p-3"
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Event Logistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Time</label>
            <Input
              type="datetime-local"
              {...register("startTime")}
              className="w-full"
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Time</label>
            <Input
              type="datetime-local"
              {...register("endTime")}
              className="w-full"
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Location Name</label>
            <Input
              {...register("location")}
              className="w-full"
              placeholder="Enter location name"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">Pick Location on Map</label>
          <LocationPicker
            location={watch("location")}
            locationURL={locationURL}
            onChange={({ url }) => {
              setValue("locationURL", url);
              setLocationURL(url);
            }}
          />
          <input type="hidden" {...register("locationURL")} value={locationURL} />
          {errors.locationURL && (
            <p className="text-red-500 text-sm mt-1">{errors.locationURL.message}</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Ticket Types</h2>
        <div className="space-y-6">
          {ticketFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg space-y-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    {...register(`ticketTypes.${index}.name`)}
                    placeholder="Ticket name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Input
                    {...register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Price"
                  />
                  {errors.ticketTypes?.[index]?.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.ticketTypes[index].price?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Currency</label>
                  <Input
                    {...register(`ticketTypes.${index}.currency`)}
                    placeholder="Currency"
                  />
                  {errors.ticketTypes?.[index]?.currency && (
                    <p className="text-red-500 text-sm mt-1">{errors.ticketTypes[index].currency?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <Input
                    {...register(`ticketTypes.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Quantity"
                  />
                  {errors.ticketTypes?.[index]?.quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.ticketTypes[index].quantity?.message}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => removeTicket(index)}
                variant="destructive"
                size="sm"
              >
                Remove Ticket
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendTicket({ name: "", price: 0, currency: "INR", quantity: 0 })}
            variant="outline"
          >
            Add Ticket Type
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Sponsorship Types</h2>
        <div className="space-y-6">
          {sponsorFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg space-y-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    {...register(`sponsorshipTypes.${index}.name`)}
                    placeholder="Sponsorship name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">Benefits</label>
                  <Input
                    {...register(`sponsorshipTypes.${index}.benefits`)}
                    placeholder="Benefits (comma separated)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <Input
                    {...register(`sponsorshipTypes.${index}.price`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="Price"
                  />
                  {errors.sponsorshipTypes?.[index]?.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.sponsorshipTypes[index].price?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Currency</label>
                  <Input
                    {...register(`sponsorshipTypes.${index}.currency`)}
                    placeholder="Currency"
                  />
                  {errors.sponsorshipTypes?.[index]?.currency && (
                    <p className="text-red-500 text-sm mt-1">{errors.sponsorshipTypes[index].currency?.message}</p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={() => removeSponsor(index)}
                variant="destructive"
                size="sm"
              >
                Remove Sponsorship
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => appendSponsor({ name: "", benefits: "", price: 0, currency: "INR" })}
            variant="outline"
          >
            Add Sponsorship Type
          </Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
