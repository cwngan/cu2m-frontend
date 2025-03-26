"use client";
export default function Page() {
  return (
    <div className="container mx-auto h-screen flex flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-6xl">Forgot your password?</h2>
      <div className="p-12 text-3xl flex flex-col items-center gap-10 h-[28rem] justify-center">
        <div className="w-2xl text-center">
          If you have entered a valid email, we have sent an email containing a
          link to continue the password reset process.
        </div>
        <div>Please check your spam mailbox!</div>
      </div>
    </div>
  );
}
