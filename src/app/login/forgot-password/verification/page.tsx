export default function Page() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-6xl">Forgot your password?</h2>
      <div className="flex h-[28rem] flex-col items-center justify-center gap-10 p-12 text-3xl">
        <div className="w-2xl text-center">
          If you have entered a valid email, we have sent an email containing a
          link to continue the password reset process.
        </div>
        <div>Please check your spam mailbox!</div>
      </div>
    </div>
  );
}
