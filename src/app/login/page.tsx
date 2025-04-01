"use client";
import Link from "next/link";
import InputBox from "./components/InputBox";
import Button from "./components/Button";

export default function Page() {
  return (
    <div className="container mx-auto h-screen flex flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-4xl">Login</h2>
      <div className="rounded-4xl border p-8 flex flex-col items-start gap-3">
        <div>
          <div className="mb-2 text-xl">Username</div>
          <InputBox type="email" placeholder="user123" />
        </div>
        <div>
          <div className="mb-2 text-xl">Password</div>
          <InputBox type="password" />
          <div className="mt-1">
            <Link
              href="/login/forgot-password"
              className="text-gray-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <Button
            text="Login"
            action={() => {
              alert("hi");
            }}
          />
        </div>
      </div>
    </div>
  );
}
