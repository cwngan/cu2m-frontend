"use client";
import Link from "next/link";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";
import "@/app/background.css";
import { apiClient } from "@/apiClient";
import { useState } from "react";
import clsx from "clsx";

export default function Page() {
  const[alertBanner, setAlertBanner] = useState(false);
  const[bannerVisible, setBannerVisible] = useState(false);
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
                setAlertBanner(true);
                setTimeout(() => setBannerVisible(true), 10);
              }
            })
            .catch((err) => {
              console.error(err);
              setAlertBanner(true);
              setTimeout(() => setBannerVisible(true), 10);
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
        {/* alert block */}
        {alertBanner && (
          <div className={clsx("absolute left-1/2 -translate-x-1/2 p-3 z-50 flex justify-center items-center transition duration-600 ease-in-out transform", bannerVisible ? "opacity-100 scale-100" : "opacity-0 scale-90")}
                onClick={() => { setAlertBanner(false); setBannerVisible(false) }}>
            <div className="flex items-center gap-2 mt-4 max-w-md rounded-xl bg-red-100 p-4 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
              </svg>
              <p>Login failed, please try again.</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
