"use client";
import InputBox from "../components/InputBox";
import Button from "../components/Button";

export default function Page() {
  return (
    <div className="container mx-auto h-screen flex flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-6xl">Forgot your password?</h2>
      <div className="p-12 flex flex-col items-start gap-24 h-[28rem] justify-end">
        <div className="flex w-full flex-col items-center">
          <div className="text-2xl mb-2">
            Enter the email you used for registering the account.
          </div>
          <InputBox
            type="email"
            className="w-112"
            placeholder="abc@gmail.com"
          />
        </div>
        <div className="flex justify-center w-full">
          <Button
            text="Submit"
            action={() => {
              alert("hi");
            }}
          />
        </div>
      </div>
    </div>
  );
}
