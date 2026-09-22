"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Chat } from "@/components/chat";
import { authClient } from "@/lib/auth-client"; // Ensure useSession is exported here or use authClient.useSession()

export default function Home() {
  // 1. Get the session data and loading state using the Better Auth hook
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState<any>();
  useEffect(() => {
    if (session) {
      setUser(session.user);
    }
  });
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploading(true);
  //   setStatus("Uploading...");
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   try {
  //     const res = await fetch("/api/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await res.json();
  //     if (res.ok) {
  //       setStatus(`Successfully uploaded ${file.name}`);
  //     } else {
  //       setStatus(`Error: ${data.error}`);
  //     }
  //   } catch (err) {
  //     setStatus("Upload failed.");
  //   } finally {
  //     setUploading(false);
  //   }

  // 2. Render a loading spinner/text while checking authentication status
  // if (isPending) {
  //   return (
  //     <div className="h-screen w-screen flex justify-center items-center">
  //       <p className="text-gray-500 font-medium animate-pulse">
  //         Loading auth status...
  //       </p>
  //     </div>
  //   );
  // }

  // 3. Conditional Layout: If the user is logged in, show the chat dashboard
  if (session) {
    return (
      <div className="h-screen w-screen flex overflow-hidden">
        {/* Left Section - Sidebar Controls */}
        <div className="w-[30vw] border-r p-8 flex flex-col justify-center items-center gap-4 bg-gray-50">
          {/* Display User Profile Info */}
          <div className="flex flex-col items-center gap-2 mb-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-12 h-12 rounded-full shadow"
              />
            )}
            <p className="font-semibold text-gray-800">
              Hello, {session.user.name}!
            </p>
            <button
              onClick={() => authClient.signOut()}
              className="text-xs text-red-500 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>

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

  // 4. Default Layout: Show Login button if not authenticated
  return (
    <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
      <button
        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-sm"
        onClick={() =>
          authClient.signIn.social({
            provider: "google",
          })
        }
      >
        Login with Google
      </button>
    </div>
  );
}
