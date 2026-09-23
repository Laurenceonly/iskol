 import Link from "next/link";
import AuthShell from "@/components/auth-shell";

export default function CheckEmailPage() {
  return (
    <AuthShell mode="status">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
          ✉
        </div>

        <h1 className="mt-5 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.055em]">
          Check your email.
        </h1>

        <p className="mt-4 max-w-sm text-[15px] leading-7 text-muted-foreground">
          We sent you a confirmation link. Open it to finish
          creating your ISKOL account.
        </p>

        <p className="mt-5 text-sm text-muted-foreground">
          You can close this page after opening the link.
        </p>

        <Link
          href="/auth/login"
          className="btn-secondary mt-7"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}