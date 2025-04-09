"use client";
import Link from "next/link";
import InputBox from "./components/InputBox";
import Button from "./components/SubmitButton";
import axios from "axios";

export default function Page() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-4xl">Login</h2>
      {/* Directly redirect to dashboard for development use */}
      <form
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = {
            username: formData.get("username"),
            password: formData.get("password"),
          };
          axios
            .post("/api/user/login", data)
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
        <div className="flex flex-col items-start gap-3 rounded-4xl border p-8">
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
            <div className="mt-1">
              <Link
                href="/login/forgot-password"
                className="text-gray-500 hover:underline"
              >
                Forgot password?
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
