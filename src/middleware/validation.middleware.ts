import {
  registration as registrationSchema,
  login as loginSchema,
} from "../utils/schema.js";
import { validate } from "../utils/validate.js";

export const registration = validate(registrationSchema);
export const login = validate(loginSchema);
