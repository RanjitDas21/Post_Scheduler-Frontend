const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 px-8 py-6 bg-white border-b border-cream-200">
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
