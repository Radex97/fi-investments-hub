
import * as React from "react";
import { QrCode } from "lucide-react"; 

interface QRCodeProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  bgColor?: string;
  fgColor?: string;
}

export const QRCode = ({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000"
}: QRCodeProps) => {
  const qrCodeUrl = React.useMemo(() => {
    // Use the QR Server API to generate QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=${bgColor.replace("#", "")}&color=${fgColor.replace("#", "")}`;
  }, [value, size, bgColor, fgColor]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <img src={qrCodeUrl} alt="QR Code" width={size} height={size} />
      </div>
    </div>
  );
};
