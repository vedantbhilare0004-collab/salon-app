"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  MonitorDot,
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  Play,
  Square,
  Sparkles,
  Scissors,
  Calendar,
  Check,
} from "lucide-react";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, type ShopStatus, type BranchId, type AttendanceShift } from "@/lib/types";
import { PageHeader, StatCard, Section, EmptyState } from "@/components/ui-kit";
import { BranchSwitcher } from "@/components/shell/branch-switcher";
import { AppointmentActionCard } from "@/components/staff/appointment-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { todayISO, formatTime, formatDate } from "@/lib/format";
import { attendanceService } from "@/lib/services/attendanceService";
import { toast } from "sonner";

export default function StaffDashboard() {
  const { currentUser, activeBranchId, getShopStatus, appointments, services, completeAppointment, startService } = useData();
  const router = useRouter();
  const [shift, setShift] = useState<AttendanceShift | null>(null);
  const [shiftLoading, setShiftLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id || currentUser?.uid) {
      const staffId = currentUser.id || currentUser.uid;
      attendanceService.getTodayShift(staffId).then((s) => {
        if (s) setShift(s);
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const staffId = currentUser.id || currentUser.uid;
  const status = getShopStatus(activeBranchId);
  const today = todayISO();

  // All today's appointments on this branch
  const todaysBranch = appointments.filter((a) => a.branchId === activeBranchId && a.date === today);

  // Appointments specifically assigned to this staff member or unassigned on floor
  const myAppointments = todaysBranch.filter((a) => a.assignedStaffId === staffId || a.staffId === staffId);
  const floorAppointments = myAppointments.length > 0 ? myAppointments : todaysBranch;

  const pending = floorAppointments.filter((a) => a.status === "pending" || a.status === "Booked");
  const confirmed = floorAppointments.filter((a) => a.status === "confirmed" || a.status === "Confirmed");
  const inService = floorAppointments.filter((a) => a.status === "in_service" || a.status === "In Progress");
  const completed = floorAppointments.filter((a) => a.status === "completed" || a.status === "Completed");

  const actionNeeded = [...inService, ...confirmed, ...pending].sort((a, b) =>
    (a.startTime || a.time).localeCompare(b.startTime || b.time)
  );

  const handleClockIn = async () => {
    setShiftLoading(true);
    try {
      const newShift = await attendanceService.clockIn(staffId, currentUser.fullName);
      setShift(newShift);
      toast.success("Clocked in successfully! Have a productive shift.");
    } catch (err) {
      console.error(err);
      toast.error("Could not record clock in");
    } finally {
      setShiftLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!shift?.id) return;
    setShiftLoading(true);
    try {
      await attendanceService.clockOut(shift.id);
      setShift((prev) => (prev ? { ...prev, status: "Completed", clockOutTime: new Date().toISOString() } : null));
      toast.success("Clocked out successfully! Great work today.");
    } catch (err) {
      console.error(err);
      toast.error("Could not record clock out");
    } finally {
      setShiftLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salon Floor Operations"
        subtitle={`Welcome back, ${currentUser.fullName}.`}
        action={
          <div className="hidden items-center gap-2 sm:flex">
            <Button className="gap-2" onClick={() => router.push("/staff-reception")}>
              <MonitorDot className="h-4 w-4" /> Reception
            </Button>
          </div>
        }
      />

      {/* Staff Shift Punch Clock Card */}
      <Card className="p-5 border border-border shadow-sm bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Staff Shift Attendance Punch Clock
              </span>
              {shift?.status === "Active" ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] uppercase font-bold animate-pulse">
                  On Shift
                </Badge>
              ) : shift?.status === "Completed" ? (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Shift Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] uppercase text-muted-foreground">
                  Not Clocked In
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {shift?.status === "Active"
                ? `Clocked in at ${formatTime(shift.clockInTime.split("T")[1]?.substring(0, 5) || "09:00")}. Currently available for service allocation.`
                : shift?.status === "Completed"
                ? `Today's shift completed (Out: ${formatTime(shift.clockOutTime?.split("T")[1]?.substring(0, 5) || "20:00")}).`
                : "Record your daily attendance before commencing customer appointments."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {shift?.status !== "Active" && shift?.status !== "Completed" && (
              <Button
                onClick={handleClockIn}
                disabled={shiftLoading}
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                <Play className="h-4 w-4" /> Clock In
              </Button>
            )}

            {shift?.status === "Active" && (
              <Button
                onClick={handleClockOut}
                disabled={shiftLoading}
                variant="outline"
                className="w-full sm:w-auto gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 font-medium"
              >
                <Square className="h-4 w-4" /> Clock Out
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={pending.length} icon={ClipboardList} />
        <StatCard label="Confirmed" value={confirmed.length} icon={UserCheck} />
        <StatCard label="In Service" value={inService.length} icon={Scissors} />
        <StatCard label="Completed Today" value={completed.length} icon={CheckCircle2} />
      </div>

      <CardLive status={status} activeBranchId={activeBranchId} />

      <Section
        title={myAppointments.length > 0 ? "My Assigned Appointments" : "Today's Schedule & Queue"}
        description="Progress client appointments from confirmed to in-service and completed."
      >
        {actionNeeded.length === 0 ? (
          <EmptyState icon={ClipboardList} title="All clear" description="No active appointments awaiting action." />
        ) : (
          <div className="grid gap-3">
            {actionNeeded.map((a) => (
              <AppointmentActionCard key={a.id} appointment={a} role="staff" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function CardLive({ status, activeBranchId }: { status: ShopStatus; activeBranchId: BranchId }) {
  return (
    <div className="flex flex-col gap-5 rounded-sm border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:justify-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Now Serving</p>
        <p className="font-heading text-2xl font-bold text-primary">{status.nowServingToken ? `#${status.nowServingToken}` : "—"}</p>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4 py-2 sm:py-0">
        <div className="text-center min-w-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Waiting in Salon</p>
          <p className="font-heading text-4xl font-bold leading-none tracking-tight">{status.waitingCount}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-col sm:justify-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Wait</p>
        <div className="flex items-baseline gap-1">
          <p className="font-heading text-2xl font-bold">{status.estimatedWaitMin}</p>
          <span className="text-xs font-medium text-muted-foreground">m</span>
        </div>
      </div>
    </div>
  );
}
