"use client";
import { apiClient } from "@/apiClient";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      alert("Invalid token");
      window.location.href = "/user/login";
    }
  }, [token]);

  return (
    <div className="relative z-40 container mx-auto flex h-screen w-screen flex-col items-center justify-center gap-8">
      <h2 className="z-40 text-4xl">Reset Password</h2>
      {/* Directly redirect to dashboard for development use */}
      <form
        className="z-40"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData.entries());
          apiClient
            .post("/api/user/reset-password", data)
            .then((res) => {
              if (res.status === 200) {
                window.location.href = "/dashboard";
              } else {
                alert("Reset password failed");
              }
            })
            .catch((err) => {
              console.error(err);
              alert("Reset password failed");
            });
        }}
      >
        {/* input block */}
        <div className="flex flex-col items-start gap-3 rounded-4xl bg-white p-8 shadow-lg">
          <div>
            <div className="mb-2 text-xl">New Password</div>
            <InputBox
              type="password"
              placeholder="Enter new password"
              name="newPassword"
              required
            />
          </div>
          <div>
            <div className="mb-2 text-xl">Confirm Password</div>
            <InputBox
              type="password"
              placeholder="Confirm new password"
              name="confirmPassword"
              required
            />
          </div>
          <div className="flex w-full justify-center">
            <Button text="Reset Password" />
          </div>
        </div>
      </form>
    </div>
  );
}
