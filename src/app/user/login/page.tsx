"use client";
import Link from "next/link";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";
import "@/app/background.css";
import axios from "axios";
import { showErrorToast, UserException } from "../../utils/toast";

export default function Page() {
  return (
    <div className="relative z-40 container mx-auto flex h-screen w-screen flex-col items-center justify-center gap-8">
      <h2 className="z-40 text-4xl">Login</h2>
      <form
        className="z-40"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData.entries());
          axios
            .post("/api/user/login", data, {
              baseURL: process.env.NEXT_PUBLIC_API_URL,
            })
            .then((res) => {
              if (res.status === 200) {
                window.location.href = "/dashboard";
              } else {
                const exception: UserException = res.data?.error?.kind || 'BadRequest';
                showErrorToast(exception);
              }
            })
            .catch((err) => {
              console.error(err);
              const exception: UserException = err.response?.data?.error?.kind || 'InternalError';
              showErrorToast(exception);
            });
        }}
      >
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