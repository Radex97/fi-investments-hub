
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        style: {
          background: "white",
          color: "black",
          border: "1px solid #F2F2F2",
        },
        classNames: {
          toast: "group",
          error: "border-l-4 border-red-500",
          success: "border-l-4 border-green-500",
          warning: "border-l-4 border-yellow-500",
          info: "border-l-4 border-blue-500",
        }
      }}
    />
  );
}
