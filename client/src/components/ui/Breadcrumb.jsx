import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './Icons';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          {item.path ? (
            <Link to={item.path} className="transition hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary">{item.label}</span>
          )}
          {index < items.length - 1 ? <ChevronRightIcon className="h-3 w-3" /> : null}
        </span>
      ))}
    </nav>
  );
}
