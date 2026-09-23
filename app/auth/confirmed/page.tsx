import Link from "next/link";
import AuthShell from "@/components/auth-shell";

export default function ConfirmedPage() {
  return (
    <AuthShell mode="status">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-semibold text-primary">
          ✓
        </div>

        <p className="mt-6 text-sm font-medium text-primary">
          Email verified
        </p>

        <h1 className="mt-3 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.055em]">
          You&apos;re ready.
        </h1>

        <p className="mt-4 max-w-sm text-[15px] leading-7 text-muted-foreground">
          Your email has been confirmed and your ISKOL
          account is ready.
        </p>

        <Link
          href="/dashboard"
          className="btn-primary mt-7"
        >
          Continue to ISKOL
        </Link>
      </div>
    </AuthShell>
  );
}
