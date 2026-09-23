"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import LogoutButton from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";

const mainNav = [
  {
    href: "/dashboard",
    label: "Home",
    icon: HomeIcon,
  },
  {
    href: "/subjects",
    label: "Subjects",
    icon: SubjectsIcon,
  },
  {
    href: "/notes",
    label: "Notes",
    icon: NotesIcon,
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: CalendarIcon,
  },
];

const mobileNav = [
  ...mainNav,
  {
    href: "/profile",
    label: "Profile",
    icon: ProfileIcon,
  },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AppShellContent>
        {children}
      </AppShellContent>
    </Suspense>
  );
}


function AppShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const supabase = createClient();

  const [isAdmin, setIsAdmin] =
    useState(false);


  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(
        data?.is_admin ?? false
      );
    }

    checkAdmin();
  }, [supabase]);


  const navigation = isAdmin
  ? [
      {
        href: "/admin",
        label: "Dashboard",
        icon: HomeIcon,
      },
    ]
  : mainNav;


const mobileNavigation = isAdmin
  ? [
      {
        href: "/admin",
        label: "Dashboard",
        icon: HomeIcon,
      },
    ]
  : mobileNav;


  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }


  function toggleTheme() {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark"
    );
  }


  return (
    <main className="min-h-dvh bg-white text-foreground dark:bg-[#0f1411]">

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] bg-[#173c2d] md:flex md:flex-col">

        <div className="flex h-full flex-col px-5 py-7">

          <Link
  href={isAdmin ? "/admin" : "/dashboard"}
  className="w-fit px-2"
>
            <span className="text-[21px] font-extrabold tracking-[-0.055em] text-white">
              ISKOL
            </span>
          </Link>


          <nav className="mt-12 space-y-1">

            {navigation.map((item) => {
              const active =
                isActive(item.href);

              const Icon = item.icon;


              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex h-11 items-center gap-3 rounded-[11px] px-3 text-sm transition ${
                    active
                      ? "bg-white/[0.12] font-semibold text-white"
                      : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >

                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active
                        ? "text-white"
                        : "text-white/55"
                    }`}
                  />

                  <span>
                    {item.label}
                  </span>

                </Link>
              );
            })}

          </nav>


          <div className="mt-auto">

            <div className="mb-4 border-t border-white/10 pt-4">

              <Link
                href="/profile"
                className={`flex h-11 items-center gap-3 rounded-[11px] px-3 text-sm ${
                  isActive("/profile")
                    ? "bg-white/[0.12] text-white"
                    : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                }`}
              >

                <ProfileIcon className="h-[18px] w-[18px]" />

                <span>
                  Profile
                </span>

              </Link>


              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-11 w-full items-center gap-3 rounded-[11px] px-3 text-sm text-white/60 hover:bg-white/[0.07] hover:text-white"
              >

                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-[18px] w-[18px]" />
                ) : (
                  <MoonIcon className="h-[18px] w-[18px]" />
                )}

                <span>
                  {resolvedTheme === "dark"
                    ? "Light mode"
                    : "Dark mode"}
                </span>

              </button>

            </div>


            <div className="px-3 text-white">
              <LogoutButton />
            </div>

          </div>

        </div>

      </aside>
            <div className="min-h-dvh bg-white md:ml-[250px] dark:bg-[#0f1411]">

        <header className="flex h-16 items-center justify-between border-b border-[#e5e9e6] bg-white px-5 dark:border-white/10 dark:bg-[#0f1411] md:hidden">

          <Link href={isAdmin ? "/admin" : "/dashboard"}>
            <span className="text-[19px] font-extrabold tracking-[-0.055em]">
              ISKOL
            </span>
          </Link>


          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <SunIcon className="h-[17px] w-[17px]" />
            ) : (
              <MoonIcon className="h-[17px] w-[17px]" />
            )}
          </button>

        </header>


        <div className="mx-auto w-full max-w-[1480px] px-5 pb-28 pt-8 sm:px-7 md:px-10 md:pb-12 md:pt-10 xl:px-14 2xl:px-16">
          {children}
        </div>

      </div>



      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e4e9e5] bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#111713]/95 md:hidden">

        <div className="mx-auto grid max-w-xl grid-cols-5 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2">

          {mobileNavigation.map((item) => {

            const active =
              isActive(item.href);

            const Icon = item.icon;


            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium ${
                  active
                    ? "text-[#1f4d3a] dark:text-[#74aa8e]"
                    : "text-muted-foreground"
                }`}
              >

                <div
                  className={`flex h-7 w-9 items-center justify-center rounded-full ${
                    active
                      ? "bg-[#e9f0eb] dark:bg-[#173426]"
                      : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                <span>
                  {item.label}
                </span>

              </Link>
            );

          })}

        </div>

      </nav>

    </main>
  );
}



/* FALLBACK */

function AppShellFallback() {
  return (
    <main className="min-h-dvh bg-white dark:bg-[#0f1411]">

      <aside className="fixed inset-y-0 left-0 hidden w-[250px] bg-[#173c2d] md:block">
        <div className="px-7 py-7">
          <span className="text-[21px] font-extrabold tracking-[-0.055em] text-white">
            ISKOL
          </span>
        </div>
      </aside>


      <div className="md:ml-[250px]">
        <div className="px-5 py-8 md:px-10">
          <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
        </div>
      </div>

    </main>
  );
}



/* ICONS */

type IconProps = {
  className?: string;
};


function HomeIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}


function SubjectsIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17V4.5Z" />
      <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19" />
      <path d="M9 8h6" />
    </svg>
  );
}


function NotesIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6.5 3.5h8L18.5 7v13.5h-12V3.5Z" />
      <path d="M14.5 3.5V7h4" />
      <path d="M9.5 11h6" />
      <path d="M9.5 15h6" />
    </svg>
  );
}


function CalendarIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="15"
        rx="2.5"
      />

      <path d="M7.5 3.5v4" />
      <path d="M16.5 3.5v4" />
      <path d="M3.5 9.5h17" />
    </svg>
  );
}


function ProfileIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-4 3.1-6 7-6s6.4 2 7 6" />
    </svg>
  );
}


function MoonIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
    </svg>
  );
}


function SunIcon({
  className,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2" />
      <path d="M12 19.5v2" />
      <path d="m4.6 4.6 1.4 1.4" />
      <path d="m18 18 1.4 1.4" />
      <path d="M2.5 12h2" />
      <path d="M19.5 12h2" />
      <path d="m4.6 19.4 1.4-1.4" />
      <path d="m18 6 1.4-1.4" />
    </svg>
  );
}
