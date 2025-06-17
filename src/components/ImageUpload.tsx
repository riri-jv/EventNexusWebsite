"use client";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const { data, error } = await res.json();
      if (!res.ok) {
        throw new Error(error.message || "Upload failed");
      }

      onChange(data.id);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadArea = () => (
    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
        </svg>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
      </div>
      <input 
        type="file" 
        className="hidden" 
        onChange={handleUpload}
        accept="image/*"
        disabled={isUploading}
      />
    </label>
  );

  const renderImage = () => (
    <div className="relative w-full h-64 group">
      <Image
        src={`/api/uploads/${value}`!}
        alt="Event image"
        fill
        className="rounded-lg object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onChange("")}
          className="z-10"
        >
          Remove Image
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-center w-full">
        {isUploading ? (
          <div className="flex justify-center">
            <Loading />
          </div>
        ) : value?.trim() ? (
          renderImage()
        ) : (
          renderUploadArea()
        )}
      </div>
    </div>
  );
}