"use client";

import { useRouter } from "next/navigation";
import { Copy, LogOut, ShieldCheck, Edit2, Check, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useData } from "@/lib/store";
import { BRANCH_LABELS, ROLE_LABELS } from "@/lib/types";
import { PageHeader, UserAvatar } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordDialog } from "@/components/password-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/services/userService";

export function ProfileView() {
  const { currentUser, logout, getBranch } = useData();
  const { t } = useTranslation();
  const router = useRouter();
  const [pwOpen, setPwOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", address: "" });

  if (!currentUser) return null;

  const branchId =
    currentUser.role === "customer"
      ? currentUser.preferredBranch
      : (currentUser.staffBranch ?? currentUser.ownerBranch ?? "koregaon");
  const branch = getBranch(branchId);

  function copyId() {
    navigator.clipboard?.writeText(currentUser!.id);
    toast.success(t("profile.id_copied"));
  }

  function handleEdit() {
    setFormData({
      fullName: currentUser!.fullName || "",
      phone: currentUser!.phone || "",
      address: currentUser!.address || "",
    });
    setIsEditing(true);
  }

  async function handleSave() {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      toast.error(t("profile.required_fields"));
      return;
    }
    setSaving(true);
    try {
      await userService.updateUserByUid(currentUser!.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success(t("profile.updated"));
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || t("profile.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("profile.title")} 
        subtitle={t("profile.subtitle")} 
        action={
          !isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-9 gap-2">
              <Edit2 className="h-4 w-4" /> {t("common.edit")}
            </Button>
          )
        }
      />

      <Card className="flex flex-col items-center gap-3 p-6 text-center border-[#E9E1D6] bg-[#FFFDFA] shadow-none rounded-none">
        <UserAvatar name={currentUser.fullName} color={currentUser.avatarColor} className="h-20 w-20 text-2xl border-2 border-[#E9E1D6]" />
        <div>
          <p className="font-sans text-xl font-semibold text-[#302A24]">{currentUser.fullName}</p>
          <Badge className="mt-1 bg-[#F0EBE3] text-[#A27C48] border-[#E9E1D6] font-medium" variant="outline">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> {ROLE_LABELS[currentUser.role]}
          </Badge>
        </div>
        <button
          onClick={copyId}
          className="flex items-center gap-2 rounded-none border border-dashed border-[#E9E1D6] bg-[#F6F3ED] px-4 py-2 text-sm transition-colors hover:bg-[#F0EBE3] text-[#302A24]"
        >
          <span className="font-mono font-semibold tracking-wider">{currentUser.id}</span>
          <Copy className="h-4 w-4 text-[#74695E]" />
        </button>
        <p className="text-xs text-[#74695E]">{t("profile.permanent_id")}</p>
      </Card>

      <Card className="divide-y divide-[#E9E1D6] p-0 border-[#E9E1D6] bg-[#FFFDFA] shadow-none rounded-none overflow-hidden">
        {isEditing ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#5C5B56]">{t("profile.full_name")}</label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                placeholder={t("profile.full_name")}
                className="h-11 text-base bg-[#FFFDFA] border-[#E9E1D6] text-[#222220] focus-visible:ring-[#A27C48] rounded-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#5C5B56]">{t("profile.phone")}</label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder={t("profile.phone")} 
                className="h-11 text-base bg-[#FFFDFA] border-[#E9E1D6] text-[#222220] focus-visible:ring-[#A27C48] rounded-none"
              />
            </div>
            <div className="space-y-1.5 opacity-70">
              <label className="text-sm font-semibold text-[#5C5B56]">{t("profile.email_readonly")}</label>
              <Input 
                value={currentUser.email} 
                disabled 
                className="h-11 text-base bg-[#F0EBE3] border-[#E9E1D6] text-[#74695E] rounded-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#5C5B56]">{t("profile.address")}</label>
              <Input 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                placeholder={t("profile.address")} 
                className="h-11 text-base bg-[#FFFDFA] border-[#E9E1D6] text-[#222220] focus-visible:ring-[#A27C48] rounded-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-4 mt-2 border-t border-[#E9E1D6]">
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={saving} className="rounded-none text-sm text-[#5C5B56] hover:bg-[#F0EBE3] hover:text-[#222220] h-10 px-4">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-none bg-[#A27C48] hover:bg-[#876438] text-white text-sm font-semibold h-10 px-5">
                <Check className="h-4 w-4" /> {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Full Name" value={currentUser.fullName} />
            <Field label="Phone" value={currentUser.phone} />
            <Field label="Email" value={currentUser.email} />
            {currentUser.address && <Field label="Address" value={currentUser.address} />}
            <Field label="Salon" value="Glow & Glamour Hair Studio" />
            {currentUser.role === "staff" && currentUser.staffPosition && (
              <Field label="Position" value={currentUser.staffPosition} />
            )}
          </>
        )}
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#222220] hover:bg-[#F0EBE3] h-11 text-sm sm:text-base font-semibold" onClick={() => setPwOpen(true)}>
          Change Password
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#8C3930] hover:bg-[#F7E7E3] h-11 text-sm sm:text-base font-semibold"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <PasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm font-semibold text-[#5C5B56]">{label}</span>
      <span className="font-medium text-base text-[#222220] max-w-[65%] text-right break-words">{value}</span>
    </div>
  );
}
