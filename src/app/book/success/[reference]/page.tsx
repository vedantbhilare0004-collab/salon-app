import { Metadata } from "next";
import { AppointmentDetails } from "./appointment-details";

export const metadata: Metadata = {
  title: "Booking Confirmed - Glow & Glamour",
};

export default async function BookingSuccessPage(
  props: { params: Promise<{ reference: string }> }
) {
  const params = await props.params;

  return (
    <main className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AppointmentDetails reference={params.reference} />
      </div>
    </main>
  );
}
