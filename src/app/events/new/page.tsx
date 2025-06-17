"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/lib/schemas/events";
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
import { Loading } from "@/components/ui/loading";

// Dynamically import the map to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
});

type FormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [locationURL, setLocationURL] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      tickets: [
        {
          title: "",
          description: "",
          price: 1,
          quantity: 1,
        },
      ],
      packages: [{ title: "", description: "", price: 1, quantity: 1 }],
    },
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({ control, name: "tickets" });

  const {
    fields: packageFields,
    append: appendPackage,
    remove: removePackage,
  } = useFieldArray({ control, name: "packages" });

  if (
    !isLoaded ||
    (user &&
      user.publicMetadata.role !== "ORGANIZER" &&
      user.publicMetadata.role !== "ADMIN")
  ) {
    return null;
  }

  const onSubmit = async (formData: FormValues) => {
    // Check if start time is after end time
    if (new Date(formData.startTime) > new Date(formData.endTime)) {
      toast.error("Start time cannot be after end time");
      return;
    }

    try {
      setIsSubmitting(true);
      // If no image is provided, remove it from the form data
      if (!formData.image) {
        delete formData.image;
      }

      const res = await fetch("/api/events", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const { data, error } = await res.json();
      if (res.ok) {
        toast.success("Event created successfully!");
        router.push(`/events/${data.id}`);
      } else {
        toast.error(error || "Failed to create event");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        console.log("Validation errors:", formErrors); // <-- Add this
      })}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Event Overview</h2>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Event Image
            </label>
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
              <p className="text-red-500 text-sm mt-1">
                {errors.summary.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full h-32 rounded-md border resize-none focus:ring-2 focus:ring-blue-500 p-3"
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
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
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime.message}
              </p>
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
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">
              Location Name
            </label>
            <Input
              {...register("location")}
              className="w-full"
              placeholder="Enter location name"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">
            Pick Location on Map
          </label>
          <LocationPicker
            location={watch("location")}
            locationURL={locationURL}
            onChange={({ url }) => {
              setValue("locationURL", url);
              setLocationURL(url);
            }}
          />
          <input
            type="hidden"
            {...register("locationURL")}
            value={locationURL}
          />
          {errors.locationURL && (
            <p className="text-red-500 text-sm mt-1">
              {errors.locationURL.message}
            </p>
          )}
        </div>
      </Card>

      <Card className="py-6">
        <h2 className="text-2xl font-bold mb-6 px-6">Tickets</h2>
        {ticketFields.map((field, index) => (
          <div
            className="space-y-6 my-4 dark:bg-zinc-900 bg-zinc-200 px-4 mx-2 py-4 rounded-md "
            key={field.id}
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                {...register(`tickets.${index}.title`)}
                className="w-full"
                placeholder="Enter ticket title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Ticket Description
              </label>
              <textarea
                {...register(`tickets.${index}.description`)}
                className="w-full h-32 rounded-md border resize-none focus:ring-2 focus:ring-blue-500 p-3"
                placeholder="Enter ticket description"
              />
              {errors.tickets?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tickets[index].description.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  {...register(`tickets.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  placeholder="Price"
                />
                {errors.tickets?.[index]?.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tickets[index].price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantity
                </label>
                <Input
                  {...register(`tickets.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Quantity"
                />
                {errors.tickets?.[index]?.quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tickets[index].quantity?.message}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => removeTicket(index)}
              variant="destructive"
              size="sm"
              className="m-2"
            >
              Remove Ticket
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            appendTicket({
              title: "",
              price: 1,
              description: "",
              quantity: 1,
            })
          }
          className="m-2"
          variant="outline"
        >
          Add Ticket
        </Button>
      </Card>

      <Card className="py-6">
        <h2 className="text-2xl font-bold mb-6 px-6">Sponsor Packages</h2>
        {packageFields.map((field, index) => (
          <div
            className="space-y-6 my-4 dark:bg-zinc-900 bg-zinc-200 px-4 mx-2 py-4 rounded-md "
            key={field.id}
          >
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                {...register(`packages.${index}.title`)}
                className="w-full"
                placeholder="Enter package title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Package Description
              </label>
              <textarea
                {...register(`packages.${index}.description`)}
                className="w-full h-32 rounded-md border resize-none focus:ring-2 focus:ring-blue-500 p-3"
                placeholder="Enter package description"
              />
              {errors.packages?.[index]?.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.packages[index].description.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  {...register(`packages.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  placeholder="Price"
                />
                {errors.packages?.[index]?.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.packages[index].price?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantity
                </label>
                <Input
                  {...register(`packages.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Quantity"
                />
                {errors.packages?.[index]?.quantity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.packages[index].quantity?.message}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              onClick={() => removePackage(index)}
              variant="destructive"
              size="sm"
              className="m-2"
            >
              Remove Package
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() =>
            appendPackage({
              title: "",
              price: 1,
              description: "",
              quantity: 1,
            })
          }
          className="m-2"
          variant="outline"
        >
          Add Package
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loading /> : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
