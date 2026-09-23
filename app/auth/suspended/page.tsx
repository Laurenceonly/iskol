import AuthShell from "@/components/auth-shell";
import LogoutButton from "@/components/logout-button";

export default function SuspendedPage() {
  return (
    <AuthShell mode="status">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-lg text-red-600 dark:text-red-400">
          !
        </div>

        <p className="mt-6 text-sm font-medium text-red-600 dark:text-red-400">
          Account unavailable
        </p>

        <h1 className="mt-3 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-none tracking-[-0.055em]">
          Your account is suspended.
        </h1>

        <p className="mt-4 max-w-sm text-[15px] leading-7 text-muted-foreground">
          Access to this ISKOL account is currently unavailable.
          Contact support if you believe this was a mistake.
        </p>

        <div className="mt-7">
          <LogoutButton />
        </div>
      </div>
    </AuthShell>
  );
}