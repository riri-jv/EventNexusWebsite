"use server";

import { SearchUsers } from "./SearchUsers";
import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import { format } from "date-fns";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  const query = (await params.searchParams).search;
  const client = await clerkClient();
  const users = query
    ? (await client.users.getUserList({ query })).data
    : (await client.users.getUserList({ limit: 100 })).data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        {/* <p className="text-gray-600">Manage user roles and permissions</p> */}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <SearchUsers />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Active
                </th>
                {/* <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={user.imageUrl}
                          alt={`${user.firstName}'s profile`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {
                        user.emailAddresses.find(
                          (email) => email.id === user.primaryEmailAddressId
                        )?.emailAddress
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.publicMetadata.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {(user.publicMetadata.role as string) || "No role"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.lastSignInAt
                        ? format(new Date(user.lastSignInAt), "MMM d, yyyy")
                        : "Never signed in"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.lastSignInAt &&
                        format(new Date(user.lastSignInAt), "h:mm a")}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <form action={setRole} className="inline-block">
                      <input type="hidden" value={user.id} name="id" />
                      <input type="hidden" value="admin" name="role" />
                      <button
                        type="submit"
                        className="text-indigo-600 hover:text-indigo-900 text-xs font-medium px-2.5 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Make Admin
                      </button>
                    </form>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-500 mb-2">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {query
                ? "Try adjusting your search query"
                : "There are currently no users in the system"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
