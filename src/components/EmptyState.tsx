import { Link } from "@tanstack/react-router";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionTo?: string;
  actionLabel?: string;
}

export function EmptyState({ icon, title, description, actionTo, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold text-text">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral">{description}</p>
      {actionTo && actionLabel && (
        <Link to={actionTo} className="mt-6 btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
