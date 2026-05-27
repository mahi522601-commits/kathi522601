export function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L21 21" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20C6 16.5 8.8 14.8 12 14.8C15.2 14.8 18 16.5 19 20" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className = 'h-5 w-5', filled = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 20.5C8.6 17.8 4.5 14.6 4.5 9.8C4.5 7 6.6 5 9.2 5C10.8 5 12 5.8 12.9 7.1C13.8 5.8 15 5 16.6 5C19.2 5 21.3 7 21.3 9.8C21.3 14.6 17.2 17.8 13.8 20.5L12.8 21.3C12.6 21.5 12.3 21.5 12 20.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CartIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4H5L7.1 14.8C7.2 15.5 7.8 16 8.5 16H17.6C18.3 16 18.9 15.5 19 14.8L20.4 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
    </svg>
  );
}

export function MenuIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7H20" strokeLinecap="round" />
      <path d="M4 12H20" strokeLinecap="round" />
      <path d="M4 17H20" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6L18 18" strokeLinecap="round" />
      <path d="M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5L12 4L20 10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.5V20H17.5V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GridIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

export function EyeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12C4.7 7.8 8.1 5.7 12 5.7C15.9 5.7 19.3 7.8 21.5 12C19.3 16.2 15.9 18.3 12 18.3C8.1 18.3 4.7 16.2 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 6L9 12L15 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 6L15 12L9 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MinusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 12H18" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 6V18" strokeLinecap="round" />
      <path d="M6 12H18" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7H20" strokeLinecap="round" />
      <path d="M9 7V5.5C9 4.7 9.7 4 10.5 4H13.5C14.3 4 15 4.7 15 5.5V7" />
      <path d="M8.5 9.5V18.5" strokeLinecap="round" />
      <path d="M15.5 9.5V18.5" strokeLinecap="round" />
      <path d="M6.7 7L7.4 18.7C7.5 19.5 8.1 20 8.9 20H15.1C15.9 20 16.5 19.5 16.6 18.7L17.3 7" />
    </svg>
  );
}

export function StarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5L15.09 8.04L22.24 9.08L17 14.14L18.18 21.26L12 17.83L5.82 21.26L7 14.14L1.76 9.08L8.91 8.04L12 1.5Z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 12C22 16.2 21.7 17.7 21.2 18.8C20.8 19.7 20.1 20.4 19.2 20.8C18.1 21.3 16.6 21.6 12.4 21.6H11.6C7.4 21.6 5.9 21.3 4.8 20.8C3.9 20.4 3.2 19.7 2.8 18.8C2.3 17.7 2 16.2 2 12C2 7.8 2.3 6.3 2.8 5.2C3.2 4.3 3.9 3.6 4.8 3.2C5.9 2.7 7.4 2.4 11.6 2.4H12.4C16.6 2.4 18.1 2.7 19.2 3.2C20.1 3.6 20.8 4.3 21.2 5.2C21.7 6.3 22 7.8 22 12Z" />
      <path d="M10 8.8L16 12L10 15.2V8.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.6A11.4 11.4 0 0 0 12.1 0C5.5 0 0.2 5.3 0.2 11.9C0.2 14 0.7 16.1 1.8 18L0 24L6.2 22.3C8 23.2 10 23.7 12 23.7H12.1C18.7 23.7 24 18.4 24 11.8C24 8.7 22.8 5.7 20.5 3.6ZM12.1 21.7H12C10.3 21.7 8.7 21.2 7.3 20.4L6.9 20.2L3.2 21.2L4.2 17.6L3.9 17.1C2.9 15.6 2.4 13.8 2.4 11.9C2.4 6.5 6.7 2.2 12.1 2.2C14.7 2.2 17.1 3.2 19 5.1C20.8 6.9 21.8 9.3 21.8 11.9C21.8 17.4 17.5 21.7 12.1 21.7ZM17.5 14.5C17.2 14.4 15.7 13.6 15.4 13.5C15.1 13.4 14.8 13.3 14.6 13.6C14.4 13.9 13.8 14.6 13.6 14.8C13.4 15 13.2 15.1 12.9 14.9C11.1 14 9.8 12.9 8.7 11C8.4 10.5 8.9 10.5 9.4 9.6C9.5 9.4 9.5 9.2 9.4 9C9.3 8.8 8.7 7.3 8.4 6.7C8.1 6.1 7.8 6.2 7.5 6.2H6.9C6.7 6.2 6.4 6.3 6.1 6.6C5.8 6.9 5 7.6 5 9.1C5 10.6 6.1 12 6.2 12.2C6.4 12.4 8.2 15.3 11 16.5C13.8 17.8 13.8 17.3 14.3 17.3C14.8 17.3 15.8 16.6 16.1 15.9C16.4 15.2 16.4 14.7 16.3 14.5C16.2 14.6 15.9 14.6 15.7 14.5H17.5Z" />
    </svg>
  );
}

export function SparkleIcon({ className = 'h-5 w-5', ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0L13.2 10.8L24 12L13.2 13.2L12 24L10.8 13.2L0 12L10.8 10.8L12 0Z" />
    </svg>
  );
}
