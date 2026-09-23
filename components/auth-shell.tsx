import type { ReactNode } from "react";

type AuthMode =
  | "login"
  | "signup"
  | "recovery"
  | "status";

type AuthShellProps = {
  children: ReactNode;
  mode: AuthMode;
};

export default function AuthShell({
  children,
  mode,
}: AuthShellProps) {
  const panelContent = {
    login: {
      eyebrow: "Your student workspace",
      title: "Pick up where you left off.",
      description:
        "Subjects, notes, schedules and the week ahead — organized without the noise.",
    },

    signup: {
      eyebrow: "Your student workspace",
      title: "Everything for school. One quiet place.",
      description:
        "Subjects, notes, schedules and the week ahead — organized without the noise.",
    },

    recovery: {
      eyebrow: "Account recovery",
      title: "Get back to your workspace.",
      description:
        "A simple, secure way to recover access and return to your work.",
    },

    status: {
      eyebrow: "Your ISKOL account",
      title: "Your workspace stays protected.",
      description:
        "Account updates are handled quietly while your study space stays yours.",
    },
  };

  const content = panelContent[mode];

  return (
    <main className="min-h-dvh bg-[#edf0eb] p-3 dark:bg-[#0b100d] sm:p-4 lg:h-dvh lg:overflow-hidden lg:p-5">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1580px] overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_24px_80px_rgba(20,40,28,0.10)] dark:border-white/[0.06] dark:bg-[#111713] sm:min-h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.88fr_1.12fr]">
        {/* LEFT */}
        <section className="flex min-h-0 flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-12 xl:px-16">
          <header className="shrink-0">
            <span className="text-[19px] font-extrabold tracking-[-0.05em]">
              ISKOL
            </span>
          </header>

          <div className="flex flex-1 items-center py-7">
            <div className="mx-auto w-full max-w-[410px]">
              {children}
            </div>
          </div>
        </section>

        {/* FOREST PANEL */}
        <section className="relative hidden overflow-hidden bg-[#173c2d] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.08),transparent_26%),radial-gradient(circle_at_86%_84%,rgba(124,171,145,0.17),transparent_36%)]" />

          <div className="relative z-20 flex h-full flex-col p-12 xl:p-14">
            <div className="flex flex-1 items-center">
              <div className="max-w-[500px] -translate-y-3">
                <p className="text-sm font-medium text-[#a6c5b3]">
                  {content.eyebrow}
                </p>

                <h2 className="mt-4 text-[clamp(2.7rem,4.1vw,4.7rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-white">
                  {content.title}
                </h2>

                <p className="mt-6 max-w-[390px] text-[15px] leading-7 text-white/55">
                  {content.description}
                </p>
              </div>
            </div>
          </div>

          {/* PHONE */}
          <div className="absolute bottom-[9%] right-[5%] z-10 w-[255px] rotate-[2deg] xl:bottom-[10%] xl:right-[7%] xl:w-[295px]">
            <div className="rounded-[42px] border border-white/20 bg-[#0a0e0b] p-[8px] shadow-[0_45px_110px_rgba(0,0,0,0.34)]">
              <div className="relative aspect-[9/19.5] overflow-hidden rounded-[34px] bg-[#f7f8f5]">
                <div className="absolute left-1/2 top-3 h-5 w-[86px] -translate-x-1/2 rounded-full bg-[#111713]" />

                <div className="h-full px-5 pb-5 pt-12">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#7a837d]">
                        Tuesday
                      </p>

                      <p className="mt-1 text-[16px] font-semibold tracking-[-0.04em] text-[#182019]">
                        Good morning
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0eb] text-[11px] font-semibold text-[#1f4d3a]">
                      I
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-[#202a23]">
                        Today
                      </p>

                      <span className="text-[8px] font-medium text-[#64806e]">
                        Calendar
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      <PhoneClass
                        time="9:00"
                        title="Microbiology"
                        location="Lab 2"
                      />

                      <PhoneClass
                        time="1:00"
                        title="Research Methods"
                        location="Room 14"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-semibold text-[#202a23]">
                      Upcoming
                    </p>

                    <div className="mt-3 rounded-[14px] bg-[#eaf1ec] p-3.5">
                      <p className="text-[8px] font-medium text-[#1f4d3a]">
                        SEP 24
                      </p>

                      <p className="mt-1.5 text-[10px] font-semibold text-[#202a23]">
                        Assignment
                      </p>

                      <p className="mt-1 text-[8px] text-[#718077]">
                        Microbiology
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-x-5 bottom-5">
                    <div className="grid grid-cols-4 rounded-[17px] border border-[#e1e6e2] bg-white px-3 py-2.5 shadow-sm">
                      <PhoneNav label="Home" active />
                      <PhoneNav label="Subjects" />
                      <PhoneNav label="Notes" />
                      <PhoneNav label="Profile" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PhoneClass({
  time,
  title,
  location,
}: {
  time: string;
  title: string;
  location: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#e2e7e3] bg-white p-3.5">
      <div className="flex gap-3">
        <div className="w-9 shrink-0">
          <p className="text-[9px] font-semibold text-[#1f4d3a]">
            {time}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-[#202a23]">
            {title}
          </p>

          <p className="mt-1 text-[8px] text-[#89918c]">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}

function PhoneNav({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#1f4d3a]" : "bg-[#ccd5cf]"
        }`}
      />

      <span
        className={`mt-1 text-[6px] ${
          active
            ? "font-medium text-[#1f4d3a]"
            : "text-[#8a938d]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}