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

// Dynamically import the map to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const formSchema = z.object({
  ...eventOverviewSchema.shape,
  ...eventLogisticsSchema.shape,
  ticketTypes: z.array(ticketTypeSchema),
  sponsorshipTypes: z.array(sponsorshipTypeSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [locationURL, setLocationURL] = useState("");

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
      const res = await fetch("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const { eventId } = await res.json();
        router.push(`/events/${eventId}`);
      } else {
        alert("Failed to create event");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 space-y-8 bg-white dark:bg-gray-900 rounded shadow-md dark:shadow-black/40"
    >
      {/* Event Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Event Overview</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">Summary</label>
            <input
              {...register("summary")}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
          </div>
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              {...register("description")}
              className="w-full h-24 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Event Logistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              type="datetime-local"
              {...register("startTime")}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300">End Time</label>
            <input
              type="datetime-local"
              {...register("endTime")}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium text-gray-700 dark:text-gray-300">Location Name</label>
            <input
              {...register("location")}
              className="w-full rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>
        </div>

        {/* Location Picker Map */}
        <div className="mt-6">
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Pick Location on Map</label>
          <LocationPicker
            location={watch("location")}
            locationURL={locationURL}
            onChange={({ url }) => {
              setValue("locationURL", url);
              setLocationURL(url);
            }}
          />
          <input type="hidden" {...register("locationURL")} value={locationURL} />
          {errors.locationURL && <p className="text-red-500 text-sm mt-1">{errors.locationURL.message}</p>}
        </div>
      </section>

      {/* Ticket Types */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Ticket Types</h2>
        <div className="space-y-6">
          {ticketFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded space-y-3 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  {...register(`ticketTypes.${index}.name`)}
                  placeholder="Name"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Price"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`ticketTypes.${index}.currency`)}
                  placeholder="Currency"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`ticketTypes.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Quantity"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTicket(index)}
                className="text-red-600 dark:text-red-400 text-sm underline"
              >
                Remove Ticket
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendTicket({ name: "", price: 0, currency: "INR", quantity: 0 })}
          className="mt-4 w-full sm:w-auto btn btn-outline border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded px-4 py-2 transition"
        >
          Add Ticket
        </button>
      </section>

      {/* Sponsorship Types */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Sponsorship Types</h2>
        <div className="space-y-6">
          {sponsorFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded space-y-3 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  {...register(`sponsorshipTypes.${index}.name`)}
                  placeholder="Name"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`sponsorshipTypes.${index}.benefits`)}
                  placeholder="Benefits (comma separated)"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`sponsorshipTypes.${index}.price`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Price"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  {...register(`sponsorshipTypes.${index}.currency`)}
                  placeholder="Currency"
                  className="rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSponsor(index)}
                className="text-red-600 dark:text-red-400 text-sm underline"
              >
                Remove Sponsor
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendSponsor({ name: "", benefits: "", price: 0, currency: "INR" })}
          className="mt-4 w-full sm:w-auto btn btn-outline border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded px-4 py-2 transition"
        >
          Add Sponsor
        </button>
      </section>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="btn btn-primary w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded px-6 py-3 transition"
        >
          Create Event
        </button>
      </div>
    </form>
  );
}
