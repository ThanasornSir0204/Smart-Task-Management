import Swal from "sweetalert2";

function isDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function swalBase() {
  const dark = isDarkMode();
  return {
    background: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f1f5f9" : "#0f172a",
    confirmButtonColor: "#0284c7",
    cancelButtonColor: dark ? "#475569" : "#94a3b8",
  };
}

const inputClass =
  "swal2-input !mx-0 !mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white";

const selectClass =
  "swal2-select !mx-0 !mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white";

export async function swalConfirm(options: {
  title: string;
  html: string;
  confirmText?: string;
  icon?: "warning" | "question";
}): Promise<boolean> {
  const result = await Swal.fire({
    ...swalBase(),
    icon: options.icon ?? "question",
    title: options.title,
    html: options.html,
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    focusCancel: true,
  });
  return result.isConfirmed;
}

export async function swalConfirmDelete(taskTitle: string): Promise<boolean> {
  return swalConfirm({
    icon: "warning",
    title: "ยืนยันการลบ",
    html: `ต้องการลบงาน <strong>${escapeHtml(taskTitle)}</strong> ใช่หรือไม่?<br/><span class="text-sm opacity-80">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>`,
    confirmText: "ลบ",
  });
}

export async function swalConfirmLogout(): Promise<boolean> {
  return swalConfirm({
    icon: "question",
    title: "ออกจากระบบ",
    html: "ต้องการออกจากระบบใช่หรือไม่?",
    confirmText: "ออกจากระบบ",
  });
}

export async function swalAlertWarning(message: string): Promise<void> {
  await Swal.fire({
    ...swalBase(),
    icon: "warning",
    title: "แจ้งเตือน",
    text: message,
    confirmButtonText: "ตกลง",
  });
}

export async function swalAlertError(message: string): Promise<void> {
  await Swal.fire({
    ...swalBase(),
    icon: "error",
    title: "เกิดข้อผิดพลาด",
    text: message,
    confirmButtonText: "ตกลง",
  });
}

export async function swalAlertSuccess(message: string): Promise<void> {
  await Swal.fire({
    ...swalBase(),
    icon: "success",
    title: "สำเร็จ",
    text: message,
    timer: 1800,
    showConfirmButton: false,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
