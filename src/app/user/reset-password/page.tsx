'use client';
import { Suspense } from "react";
import ResetForm from "./components/ResetForm";
import { showErrorToast } from "../../utils/toast";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Page({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const router = useRouter();
  const token = searchParams.token;

  if (token) {
    axios
      .post("/api/user/verify-token", { token }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL
      })
      .catch((err) => {
        console.error(err);
        showErrorToast('InvalidResetToken');
        router.push('/user/login/forgot-password');
      });
  }

  return (
    <div className="relative z-40 container mx-auto flex h-screen w-screen flex-col items-center justify-center gap-8">
      <h2 className="z-40 text-4xl">Reset Password</h2>
      <Suspense>
        <ResetForm token={token} />
      </Suspense>
    </div>
  );
}
