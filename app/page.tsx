"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Chat } from "@/components/chat";

export default function Home() {
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(`Successfully uploaded ${file.name}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Section - Sidebar Controls */}
      <div className="w-[30vw] border-r p-8 flex flex-col justify-center items-center gap-4 bg-gray-50">
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-sm">
          {uploading ? "Uploading..." : "Upload File"}
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {status && (
          <p className="text-sm text-gray-600 text-center">{status}</p>
        )}
      </div>

      {/* Right Section - Chat Component */}
      <div className="w-[70vw] p-8 flex justify-center items-center bg-white h-full">
        <Chat />
      </div>
    </div>
  );
}
