import InputBox from "../../components/InputBox";
import Button from "../../components/SubmitButton";

export default function Page() {
  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center gap-8 pb-20">
      <h2 className="text-6xl">Forgot your password?</h2>
      <div className="flex h-[28rem] flex-col items-start justify-end gap-24 p-12">
        <div className="flex w-full flex-col items-center">
          <div className="mb-2 text-2xl">
            Enter the email you used for registering the account.
          </div>
          <InputBox
            type="email"
            className="w-112"
            placeholder="abc@gmail.com"
          />
        </div>
        <div className="flex w-full justify-center">
          <form action="forgot-password/verification">
            <Button text="Submit" />
          </form>
        </div>
      </div>
    </div>
  );
}
