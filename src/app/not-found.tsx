import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative z-40 flex h-screen w-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">404 Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/" className="mt-4 hover:underline">
        Return Home
      </Link>
    </div>
  );
}
