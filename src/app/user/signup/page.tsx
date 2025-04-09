"use client";
import InputBox from "../components/InputBox";
import Button from "../components/SubmitButton";

export default function Page() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-4xl">Signup</h2>
      {/* Directly redirect to dashboard for development use */}
      <form action="/dashboard">
        <div className="flex flex-col items-start gap-3 rounded-4xl border p-8">
          <div>
            <div className="mb-2 text-xl">Email</div>
            <InputBox
              type="email"
              placeholder="1155123456@link.cuhk.edu.hk"
              name="email"
              required
            />
          </div>
          <div>
            <div className="mb-2 text-xl">License Key</div>
            <InputBox
              type="text"
              placeholder="ABCD-EFGH-1234-5678"
              name="license_key"
              required
            />
          </div>
          <div>
            <div className="mb-2 text-xl">First Name</div>
            <InputBox
              type="text"
              placeholder="John"
              name="first_name"
              required
            />
          </div>
          <div>
            <div className="mb-2 text-xl">Last Name</div>
            <InputBox
              type="text"
              placeholder="Smith"
              name="last_name"
              required
            />
          </div>
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
          </div>
          <div className="mt-2 flex w-full justify-center">
            <Button text="Login" />
          </div>
        </div>
      </form>
    </div>
  );
}
