/**
 * Site-wide configuration
 * Public env vars must be prefixed with PUBLIC_
 */

/** 
 * Primary booking URL (Google Calendar appointment scheduling)
 * Falls back to /contact if not set
 */
export const BOOKING_URL = import.meta.env.PUBLIC_BOOKING_URL || '/contact';

/**
 * Whether booking is handled externally (Google Calendar)
 * true if PUBLIC_BOOKING_URL is set to an external URL
 */
export const IS_EXTERNAL_BOOKING = Boolean(import.meta.env.PUBLIC_BOOKING_URL?.startsWith('http'));