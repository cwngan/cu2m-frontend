"use client";
import InputBox from "../../components/InputBox";
import Button from "../../components/SubmitButton";
import { showErrorToast, UserException } from "@/app/utils/toast";
import { useRouter } from "next/navigation";
import { apiClient } from "@/apiClient";
import toast from "react-hot-toast";
// import { useState } from "react";

export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();

  return (
    <form
      className="z-40"
      action="#"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (formData.get("password") !== formData.get("confirm_password")) {
          showErrorToast("BadRequest");
          return;
        }
        const data = Object.fromEntries(formData.entries());
        apiClient
          .put("/api/user/reset-password", data)
          .then((res) => {
            if (res.status === 200) {
              toast.success(
                "Password reset successful! Redirecting to dashboard...",
                {
                  duration: 2000,
                  position: "top-center",
                },
              );
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 2000);
            }
          })
          .catch((err) => {
            console.error(err);
            const exception: UserException =
              err.response?.data?.exception || "InvalidResetToken";
            showErrorToast(exception);
            if (exception === "InvalidResetToken") {
              router.push("/user/login/forgot-password");
            }
          });
      }}
    >
      <InputBox type="hidden" name="token" value={token} />
      <div className="flex flex-col items-start gap-3 rounded-4xl bg-white p-8 shadow-lg">
        <div>
          <div className="mb-2 text-xl">New Password</div>
          <InputBox
            type="password"
            placeholder="Enter new password"
            name="password"
            required
          />
        </div>
        <div>
          <div className="mb-2 text-xl">Confirm Password</div>
          <InputBox
            type="password"
            placeholder="Confirm new password"
            required
            name="confirm_password"
          />
        </div>
        <div className="flex w-full justify-center">
          <Button text="Reset Password" />
        </div>
      </div>
    </form>
  );
}
