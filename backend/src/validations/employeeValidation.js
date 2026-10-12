import { z } from "zod";
import { objectId, paginationQuery, passwordSchema } from "./commonValidation.js";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm time format");

const employeeBody = z.object({
  employeeCode: z.string().min(3).max(40).optional(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  department: z.string().min(1).max(80),
  designation: z.string().min(1).max(80),
  shiftStartTime: timeSchema.default("09:00"),
  shiftEndTime: timeSchema.default("18:00"),
  reportingManager: objectId.optional().or(z.literal("")),
  joiningDate: z.coerce.date(),
  employmentStatus: z.enum(["probation", "active", "notice", "exited", "inactive"]).optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.coerce.date().optional(),
  emergencyContact: z
    .object({
      name: z.string().max(120).optional(),
      relation: z.string().max(80).optional(),
      phone: z.string().max(30).optional(),
    })
    .optional(),
});

export const createEmployeeSchema = z.object({
  body: employeeBody.extend({
    password: passwordSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateEmployeeSchema = z.object({
  body: employeeBody.partial(),
  params: z.object({ id: objectId }),
  query: z.object({}),
});

export const employeeListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    department: z.string().optional(),
    employmentStatus: z.enum(["probation", "active", "notice", "exited", "inactive"]).optional(),
  }),
});

export const employeeStatusSchema = z.object({
  body: z.object({ status: z.enum(["active", "inactive"]) }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});
