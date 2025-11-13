import { toast } from "react-toastify";

export default function showToast(message: string, toastType: string, duration?: number) {
    if (toastType === "success") {
        toast.success(message, {
            position: "top-center",
            autoClose: duration ?? 1500,
        });
    } else if (toastType === "error") {
        toast.error(message, {
            position: "top-center",
            autoClose: duration ?? 1500,
        });
    } else if (toastType === "warning") {
        toast.warn(message, {
            position: "top-center",
            autoClose: duration ?? 1500,
        });
    } else if (toastType === "info") {
        toast.info(message, {
            position: "top-center",
            autoClose: duration ?? 1500,
        });
    } else {
        toast(message, {
            position: "top-center",
            autoClose: duration ?? 1500,
        });
    }
}