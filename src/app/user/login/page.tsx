"use client";
import Link from "next/link";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";
import "@/app/background.css";
import { apiClient } from "@/apiClient";

export default function Page() {
  return (
    <div className="relative z-40 container mx-auto flex h-screen w-screen flex-col items-center justify-center gap-8">
      <h2 className="z-40 text-4xl">Login</h2>
      {/* Directly redirect to dashboard for development use */}
      <form
        className="z-40"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData.entries());
          apiClient
            .post("/api/user/login", data, {
              baseURL: process.env.NEXT_PUBLIC_API_URL,
            })
            .then((res) => {
              if (res.status === 200) {
                window.location.href = "/dashboard";
              } else {
                alert("Login failed");
              }
            })
            .catch((err) => {
              console.error(err);
              alert("Login failed");
            });
        }}
      >
        {/* input block */}
        <div className="flex flex-col items-start gap-3 rounded-4xl bg-white p-8 shadow-lg">
          <div>
            <div className="mb-2 text-xl">Username</div>
            <InputBox
              type="text"
              placeholder="user123"
              name="username"
              required
            />
          </div>
          <div>
            <div className="mb-2 text-xl">Password</div>
            <InputBox type="password" name="password" required />
            <div className="mt-1 flex justify-between">
              <Link
                href="login/forgot-password"
                className="text-gray-500 hover:underline"
              >
                Forgot password?
              </Link>
              <Link href="signup" className="text-gray-500 hover:underline">
                New user?
              </Link>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <Button text="Login" />
          </div>
        </div>
      </form>
    </div>
  );
}
