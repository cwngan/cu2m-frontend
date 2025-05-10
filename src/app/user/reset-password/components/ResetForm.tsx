"use client";
import { apiClient } from "@/apiClient";
import InputBox from "../../components/InputBox";
import Button from "../../components/SubmitButton";

export default function ResetForm({ token }: { token: string }) {
  return (
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
      <InputBox type="hidden" name="token" value={token} />
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
  );
}
