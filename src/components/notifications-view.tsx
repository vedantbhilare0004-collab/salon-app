"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CalendarCheck, Info, Megaphone, Ticket, X, CheckCheck, Trash2 } from "lucide-react";
import { useData } from "@/lib/store";
import { useTranslation } from "@/lib/i18n";
import { PageHeader, EmptyState } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

const ICONS = {
  booking: CalendarCheck,
  cancel: X,
  reminder: Bell,
  announcement: Megaphone,
  system: Info,
  queue: Ticket,
} as const;

export function NotificationsView() {
  const { currentUser, notificationsFor, unreadCount, markNotificationRead, markAllNotificationsRead, clearAllNotifications, deleteNotification } = useData();
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(10);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  if (!currentUser) return null;
  const list = notificationsFor(currentUser);
  const unread = unreadCount(currentUser);
  const visibleList = list.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notifications.title")}
        subtitle={unread > 0 ? `${unread} ${t("notifications.unread")}` : t("notifications.caught_up")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {unread > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead()} className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]">
                <CheckCheck className="mr-2 h-4 w-4 text-[#A27C48]" /> {t("notifications.mark_all")}
              </Button>
            )}
            {list.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => clearAllNotifications()} className="rounded-none border-[#E9E1D6] bg-[#F7E7E3] text-[#8C3930] hover:bg-[#F7E7E3]/80">
                <X className="mr-2 h-4 w-4" /> Clear All
              </Button>
            )}
          </div>
        }
      />
      {list.length === 0 ? (
        <EmptyState icon={Bell} title={t("notifications.empty")} description={t("notifications.empty_desc")} />
      ) : (
        <div className="space-y-2">
          {visibleList.map((n) => (
            <NotificationRow 
              key={n.id} 
              n={n} 
              onClick={() => markNotificationRead(n.id)} 
              onDelete={() => deleteNotification(n.id)} 
            />
          ))}
          {visibleCount < list.length && (
            <div ref={observerRef} className="h-10 flex items-center justify-center text-sm text-[#74695E]">
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n, onClick, onDelete }: { n: AppNotification; onClick: () => void; onDelete: () => void }) {
  const Icon = ICONS[n.kind] ?? Bell;
  return (
    <Card 
      className={cn(
        "group flex items-start gap-3 p-4 shadow-none rounded-none border border-[#E9E1D6] bg-[#FFFDFA] transition-colors hover:bg-[#F0EBE3]/50 cursor-pointer", 
        !n.read && "border-[#A27C48]/40 bg-[#F0EBE3]/30"
      )} 
      onClick={onClick}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-none",
          !n.read ? "bg-[#A27C48] text-white" : "bg-[#F0EBE3] text-[#74695E]"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-sm text-[#302A24]">{n.title}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#A27C48]" />}
        </div>
        <p className="text-sm text-[#74695E] mt-0.5">{n.message}</p>
        <p className="mt-1 text-xs text-[#74695E]/80">{relativeTime(n.createdAt)}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-none text-[#74695E] hover:bg-[#F7E7E3] hover:text-[#8C3930] transition-colors shrink-0 self-center"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}
