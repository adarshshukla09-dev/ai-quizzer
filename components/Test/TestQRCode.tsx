"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface TestQRCodeProps {
  testCode: string;
}
const NEXT_APP_URL ="http://localhost:3000";
export default function TestQRCode({
  testCode,
}: TestQRCodeProps) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      const url = `${NEXT_APP_URL}/test/${testCode}`;

      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      });

      setQrCode(dataUrl);
    };

    generateQR();
  }, [testCode]);

  if (!qrCode) {
    return <div>Generating QR...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={qrCode}
        alt={`QR code for test ${testCode}`}
        width={300}
        height={300}
      />

      <p className="font-mono font-semibold">
        {testCode}
      </p>
    </div>
  );
}