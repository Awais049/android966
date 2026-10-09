import { Link } from "@tanstack/react-router";

interface SectionHeaderProps {
  title: string;
  linkTo?: string;
  linkLabel?: string;
}

export function SectionHeader({ title, linkTo, linkLabel }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-text">{title}</h2>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="text-sm font-medium text-brand hover:text-brand-hover">
          {linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
