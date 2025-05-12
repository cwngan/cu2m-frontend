// signup/page.tsx
"use client";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";
import { useRouter } from "next/navigation";
import "@/app/background.css";
import { apiClient } from "@/apiClient";
import { showErrorToast, UserException } from "../../utils/toast";

export default function Page() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full w-full flex-col justify-center py-8">
        <div className="container mx-auto flex flex-col items-center justify-center gap-8">
          <h2 className="z-40 text-4xl">Sign up</h2>
          <form
            className="z-40"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              apiClient
                .post("/api/user/signup", data, {
                  baseURL: process.env.NEXT_PUBLIC_API_URL,
                })
                .then((res) => {
                  if (res.status >= 200 && res.status < 300) {
                    router.push("/dashboard");
                  } else {
                    const exception: UserException =
                      res.data?.error?.kind || "BadRequest";
                    showErrorToast(exception);
                  }
                })
                .catch((err) => {
                  console.error(err);
                  const exception: UserException =
                    err.response?.data?.error?.kind || "InternalError";
                  showErrorToast(exception);
                });
            }}
          >
            <div className="flex flex-col items-start gap-3 rounded-4xl bg-white p-8 shadow-xl">
              <div>
                <div className="mb-2 text-xl">Email</div>
                <InputBox
                  type="email"
                  placeholder="1155123456@link.cuhk.edu.hk"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="email"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">License Key</div>
                <InputBox
                  type="text"
                  placeholder="ABCD-EFGH-1234-5678"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="license_key"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">First Name</div>
                <InputBox
                  type="text"
                  placeholder="John"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="first_name"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">Last Name</div>
                <InputBox
                  type="text"
                  placeholder="Smith"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="last_name"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">Major</div>
                <InputBox
                  type="text"
                  placeholder="CSCI"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="major"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">Username</div>
                <InputBox
                  type="text"
                  placeholder="user123"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  name="username"
                  required
                />
              </div>
              <div>
                <div className="mb-2 text-xl">Password</div>
                <InputBox
                  type="password"
                  name="password"
                  className="rounded-md border-neutral-400 ring-slate-400 hover:ring-2"
                  required
                />
              </div>
              <div className="mt-2 flex w-full justify-center">
                <Button text="Signup" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
