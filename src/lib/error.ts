import { auth, clerkClient, User as ClerkUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export const ERROR_CODES = {
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_PARAMETERS: "INVALID_PARAMETERS",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",

  UNAUTHORIZED: "UNAUTHORIZED",

  FORBIDDEN_ROLE: "FORBIDDEN_ROLE",
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  USER_NOT_FOUND: "USER_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  RESOURCE_ALREADY_EXISTS: "RESOURCE_ALREADY_EXISTS",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",

  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  ROLE_NOT_FOUND: "ROLE_NOT_FOUND",
  OPERATION_NOT_ALLOWED: "OPERATION_NOT_ALLOWED",

  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",

  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  USER_SYNC_ERROR: "USER_SYNC_ERROR",

  CLERK_ERROR: "CLERK_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

const errorStatusMap: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  INVALID_PARAMETERS: 400,
  MISSING_REQUIRED_FIELD: 400,
  INVALID_DATE_RANGE: 400,

  UNAUTHORIZED: 401,

  FORBIDDEN_ROLE: 403,
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  USER_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,

  RESOURCE_ALREADY_EXISTS: 409,
  RESOURCE_CONFLICT: 409,

  INSUFFICIENT_STOCK: 422,
  ROLE_NOT_FOUND: 422,
  OPERATION_NOT_ALLOWED: 422,

  QUOTA_EXCEEDED: 429,

  INTERNAL_SERVER_ERROR: 500,
  DATABASE_ERROR: 500,
  USER_SYNC_ERROR: 500,

  CLERK_ERROR: 502,
  EXTERNAL_SERVICE_ERROR: 502,

  SERVICE_UNAVAILABLE: 503,
};

const errorMessageMap: Record<ErrorCode, string> = {
  INVALID_INPUT:
    "The provided input is invalid. Please check your data and try again.",
  INVALID_PARAMETERS: "Invalid request parameters provided.",
  MISSING_REQUIRED_FIELD: "Required field is missing from the request.",
  INVALID_DATE_RANGE: "The specified date range is invalid.",

  UNAUTHORIZED: "Authentication required. Please sign in to continue.",

  FORBIDDEN_ROLE:
    "You do not have the required permissions to access this resource.",
  FORBIDDEN: "You are not allowed to perform this operation.",
  INSUFFICIENT_PERMISSIONS:
    "You do not have sufficient permissions for this action.",

  USER_NOT_FOUND: "User account not found or has been deactivated.",
  RESOURCE_NOT_FOUND: "The requested resource could not be found.",

  RESOURCE_ALREADY_EXISTS: "A resource with these details already exists.",
  RESOURCE_CONFLICT:
    "The request conflicts with the current state of the resource.",

  INSUFFICIENT_STOCK: "Insufficient quantity available for the requested item.",
  ROLE_NOT_FOUND:
    "No role assigned to your account. Please contact an administrator.",
  OPERATION_NOT_ALLOWED:
    "This operation is not allowed in the current context.",

  QUOTA_EXCEEDED: "Request quota has been exceeded. Please try again later.",

  INTERNAL_SERVER_ERROR:
    "An unexpected error occurred. Please try again later.",
  DATABASE_ERROR: "Database operation failed. Please try again later.",
  USER_SYNC_ERROR: "User account sync issue. Please contact support.",

  CLERK_ERROR:
    "Authentication service is temporarily unavailable. Please try again later.",
  EXTERNAL_SERVICE_ERROR:
    "External service is temporarily unavailable. Please try again later.",

  SERVICE_UNAVAILABLE:
    "Service is temporarily unavailable. Please try again later.",
};

export class EventNexusError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: unknown;
  field?: string;

  constructor(code: ErrorCode, details?: unknown, field?: string) {
    super(errorMessageMap[code]);
    this.code = code;
    this.statusCode = errorStatusMap[code];
    this.details = details;
    this.field = field;
    this.name = "EventNexusError";
  }

  static validation(message: string, field?: string, details?: unknown) {
    const error = new EventNexusError("INVALID_INPUT", details, field);
    error.message = message;
    return error;
  }

  static notFound(resource: string, id?: string | number) {
    return new EventNexusError("RESOURCE_NOT_FOUND", { resource, id });
  }

  static forbidden(action?: string, resource?: string) {
    return new EventNexusError("INSUFFICIENT_PERMISSIONS", {
      action,
      resource,
    });
  }
}

export function handleApiError(error: unknown, context = "") {
  const logContext = context ? ` [${context}]` : "";

  if (error instanceof EventNexusError) {
    const isClientError = error.statusCode >= 400 && error.statusCode < 500;

    if (isClientError) {
      console.warn(
        `[API CLIENT ERROR]${logContext}: ${error.code} - ${error.message}`,
        {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          field: error.field,
        }
      );
    } else {
      console.error(
        `[API ERROR]${logContext}: ${error.code} - ${error.message}`,
        {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
          field: error.field,
          stack: error.stack,
        }
      );
    }

    const response: any = {
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.field) {
      response.error.field = error.field;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;

    switch (prismaError.code) {
    // Unique constraint violation
    case "P2002":
      const conflictError = new EventNexusError("RESOURCE_ALREADY_EXISTS", {
        field: prismaError.meta?.target,
      });
      return handleApiError(conflictError, context);

      // Record not found
    case "P2025":
      const notFoundError = new EventNexusError("RESOURCE_NOT_FOUND");
      return handleApiError(notFoundError, context);

      // Invalid format
    case "P2023":
    case "P2024": // Failed to validate the query
      const validationError = EventNexusError.validation(
        "Invalid input format provided",
        undefined,
        {
          prismaCode: prismaError.code,
          modelName: prismaError.meta?.modelName,
          originalMessage: prismaError.meta?.message,
        }
      );
      return handleApiError(validationError, context);

      // Connection/timeout errors
    case "P1001": // Can't reach database server
    case "P1002": // Database server timeout
    case "P1008": // Operations timed out
    case "P1017": // Server has closed the connection
      const serviceError = new EventNexusError("SERVICE_UNAVAILABLE", {
        prismaCode: prismaError.code,
        message: prismaError.message,
      });
      return handleApiError(serviceError, context);

      // Database schema issues
    case "P1012": // Schema validation error
    case "P2012": // Missing required value
    case "P2011": // Null constraint violation
      const schemaError = new EventNexusError("DATABASE_ERROR", {
        prismaCode: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
      });
      return handleApiError(schemaError, context);

      // Foreign key constraint errors
    case "P2003": // Foreign key constraint failed
    case "P2004": // Constraint failed
      const constraintError = new EventNexusError("RESOURCE_CONFLICT", {
        prismaCode: prismaError.code,
        field: prismaError.meta?.field_name,
      });
      return handleApiError(constraintError, context);

    default:
      console.warn(
        `[DATABASE] Unhandled Prisma error code: ${prismaError.code}`,
        {
          code: prismaError.code,
          message: prismaError.message,
          meta: prismaError.meta,
        }
      );

      const dbError = new EventNexusError("DATABASE_ERROR", {
        prismaCode: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
      });
      return handleApiError(dbError, context);
    }
  }

  console.error(`[API ERROR]${logContext}: Unexpected error:`, error);

  const internalError = new EventNexusError("INTERNAL_SERVER_ERROR");
  return NextResponse.json(
    {
      error: {
        code: internalError.code,
        message: internalError.message,
      },
    },
    { status: internalError.statusCode }
  );
}

interface AuthenticatedUser {
  clerkUser: ClerkUser;
  role: UserRole;
  userId: string;
}

async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new EventNexusError("UNAUTHORIZED");
    }

    let clerkUser;
    try {
      const client = await clerkClient();
      clerkUser = await client.users.getUser(userId);
    } catch (clerkError) {
      throw new EventNexusError("CLERK_ERROR", clerkError);
    }

    if (!clerkUser) {
      throw new EventNexusError("USER_NOT_FOUND");
    }

    const role = clerkUser.publicMetadata.role as UserRole | undefined;

    if (!role) {
      throw new EventNexusError("ROLE_NOT_FOUND", { userId });
    }

    return { clerkUser, role, userId };
  } catch (error) {
    if (error instanceof EventNexusError) {
      throw error;
    }

    if (error && typeof error === "object" && "status" in error) {
      throw new EventNexusError("CLERK_ERROR", error);
    }

    throw new EventNexusError("INTERNAL_SERVER_ERROR", error);
  }
}

/**
 * Requires authentication and specific role(s)
 * @param roles - Array of allowed roles
 * @returns User data with role information
 * @throws AppError if user is not authenticated or doesn't have required role
 */
export async function requireAuthRole(
  roles: UserRole[]
): Promise<AuthenticatedUser> {
  const { clerkUser, role, userId } = await getAuthenticatedUser();

  if (!roles.includes(role)) {
    throw new EventNexusError("FORBIDDEN_ROLE", {
      userId,
      userRole: role,
      requiredRoles: roles,
    });
  }

  return { clerkUser, role, userId };
}

/**
 * Requires authentication but no specific role
 * @returns User data with role information
 * @throws AppError if user is not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  return await getAuthenticatedUser();
}

/**
 * Gets the current user's role without throwing errors
 * @returns clerkUser and role will be null if there's no user
 */
export async function getRole(): Promise<{
  clerkUser: ClerkUser | null;
  role: UserRole | null;
}> {
  try {
    return await getAuthenticatedUser();
  } catch (error) {
    if (
      error instanceof EventNexusError &&
      !["UNAUTHORIZED", "USER_NOT_FOUND", "ROLE_NOT_FOUND"].includes(error.code)
    ) {
      console.warn(
        `[AUTH] Unexpected error in getRole: ${error.code}`,
        error.details
      );
    }
    return { clerkUser: null, role: null };
  }
}
