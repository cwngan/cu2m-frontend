import Link from "next/link";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";

export default function Page() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-4xl">Login</h2>
      {/* Directly redirect to dashboard for development use */}
      <form action="/dashboard">
        <div className="flex flex-col items-start gap-3 rounded-4xl border p-8">
          <div>
            <div className="mb-2 text-xl">Username</div>
            <InputBox type="text" placeholder="user123" required />
          </div>
          <div>
            <div className="mb-2 text-xl">Password</div>
            <InputBox type="password" required />
            <div className="mt-1">
              <Link
                href="login/forgot-password"
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
