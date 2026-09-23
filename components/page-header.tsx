export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="eyebrow">
            {eyebrow}
          </p>
        )}

        <h1 className="page-title mt-2">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}