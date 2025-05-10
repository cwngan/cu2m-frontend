import { Suspense } from "react";
import ResetForm from "./components/ResetForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const token = (await searchParams).token;

  // TO-DO: validate token

  return (
    <div className="relative z-40 container mx-auto flex h-screen w-screen flex-col items-center justify-center gap-8">
      <h2 className="z-40 text-4xl">Reset Password</h2>
      {/* Directly redirect to dashboard for development use */}
      <Suspense>
        <ResetForm token={token} />
      </Suspense>
    </div>
  );
}
