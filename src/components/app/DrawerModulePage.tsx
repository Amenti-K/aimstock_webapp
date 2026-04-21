type DrawerModulePageProps = {
  title: string;
  description: string;
  stats: Array<{ label: string; value: string }>;
};

export function DrawerModulePage({
  title,
  description,
  stats,
}: DrawerModulePageProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border bg-card p-4 text-card-foreground"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </article>
        ))}
      </div>

      <article className="rounded-lg border bg-card p-4 text-card-foreground">
        <h3 className="font-medium">Next integration</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This module is wired to the drawer and route structure. Connect this
          page to your existing API hooks from mobile as the next step.
        </p>
      </article>
    </section>
  );
}
