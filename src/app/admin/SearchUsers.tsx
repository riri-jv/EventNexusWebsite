"use client";

import { usePathname, useRouter } from "next/navigation";

export const SearchUsers = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="text-black">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const queryTerm = formData.get("search") as string;
          router.push(pathname + "?search=" + queryTerm);
        }}
      >
        <input id="search" name="search" type="text" className="mx-2 py-1 px-4 border-black outline rounded-md outline-1 dark:bg-white" placeholder="search for users" />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};