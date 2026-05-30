import { useContext } from "react";
import { ToastContext } from "../components/AppToastContext";

export function useAppToast() {
  const toast = useContext(ToastContext);

  if (!toast) {
    throw new Error("useAppToast must be used inside AppToastProvider.");
  }

  return toast;
}
