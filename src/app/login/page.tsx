"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { loginWithGoogle } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  if (pending) {
    toast.loading("Connecting to Google...", {
      id: "signInToast",
    });
  }

  return (
    <Button className="w-full rounded bg-white px-12 py-5 font-bold text-black hover:bg-white/90">
      <Image
        src="/google.svg"
        alt="Google logo"
        width={20}
        height={20}
        className="mr-2"
      />
      <p className="text-base">Log in with Google</p>
    </Button>
  );
}

export default function LoginPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4">
      <Image
        src="/logo.png"
        alt="logo"
        width={150}
        height={150}
        className="mb-6 rounded-3xl"
      />
      <h1 className="mb-2 text-2xl">
        Welcome to <span className="text-primary">Rudy!</span>
      </h1>
      <p className="text-md mb-10 px-6 text-center">
        A minimalist habit tracker - track only your sleep, exercise, and
        nutrition
      </p>
      <form action={loginWithGoogle}>
        <SubmitButton />
      </form>
    </div>
  );
}
