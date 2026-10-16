import { Appointment, Branch, Service } from "./types";

/**
 * Calculates the total duration for selected services.
 */
export function calculateTotalDuration(serviceIds: string[], allServices: Service[]): number {
  return serviceIds.reduce((total, id) => {
    const service = allServices.find((s) => s.id === id);
    return total + (service?.durationMin || 0);
  }, 0);
}

/**
 * Generates an array of available 30-minute time slots for a given date,
 * based on branch working hours, staff schedule (if we had it), and existing appointments.
 */
export function getAvailableSlots(
  date: string, // YYYY-MM-DD
  branch: Branch,
  existingAppointments: Appointment[],
  durationMin: number
): string[] {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day, 12, 0, 0); // local noon
  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const workingHours = branch.workingHours.find((wh) => wh.day === dayOfWeek);

  if (!workingHours || workingHours.closed) {
    return []; // Shop is closed
  }

  const slots: string[] = [];
  const openTime = parseTime(workingHours.open); // minutes since midnight
  const closeTime = parseTime(workingHours.close);

  // We will generate 30-minute intervals
  const INTERVAL = 30;
  
  // Filter appointments for the selected date that are not cancelled or rejected
  const activeAppointments = existingAppointments.filter((app) => 
    app.date === date && 
    !["cancelled", "rejected", "no_show"].includes(app.status)
  );

  for (let t = openTime; t + durationMin <= closeTime; t += INTERVAL) {
    const slotStart = t;
    const slotEnd = t + durationMin;

    // Check if this slot conflicts with any active appointment
    // A simplified check: if ANY appointment overlaps and we have no staff logic, 
    // it depends on available chairs/active staff.
    // For Phase 3, we simply assume if total overlapping appointments >= branch.activeStaff, it's full.
    
    let overlappingCount = 0;
    for (const app of activeAppointments) {
      const appStart = parseTime(app.time);
      // We don't have total duration in the appointment easily accessible without services,
      // but we can assume an average or fetch it if needed. 
      // For now, let's assume averageServiceTime or 30 min minimum if not available
      const appDuration = branch.averageServiceTime || 30; 
      const appEnd = appStart + appDuration;

      if (slotStart < appEnd && slotEnd > appStart) {
        overlappingCount++;
      }
    }

    if (overlappingCount < branch.activeStaff) {
      slots.push(formatTime(t));
    }
  }

  return slots;
}

/**
 * Helper to parse "HH:mm" into minutes since midnight
 */
export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper to format minutes since midnight into "HH:mm"
 */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Generates a random alphanumeric string for references and tokens.
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
