import Swal from "sweetalert2";

function swalBase() {
  return {
    background: "#1A1A1A",
    color: "#FFFFFF",
    confirmButtonColor: "#5E6AD2",
    cancelButtonColor: "#2A2A2A",
  };
}

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
    html: `ต้องการลบงาน <strong>${escapeHtml(taskTitle)}</strong> ใช่หรือไม่?<br/><span style="opacity:0.7;font-size:13px">การดำเนินการนี้ไม่สามารถย้อนกลับได้</span>`,
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
