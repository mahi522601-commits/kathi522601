import { useEffect, useState } from 'react';

const ANNOUNCEMENTS = [
    'Follow us on Instagram and get a surprise gift with your order.',
  'Website made by by WayZenTech Contact: 9398724704',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((current) => (current + 1) % ANNOUNCEMENTS.length);
        setVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden px-4 py-2.5 text-center text-xs sm:text-sm"
      style={{ background: 'var(--bg-dark)', color: 'var(--color-gold)' }}
    >
      <p
        className="tracking-[0.14em] font-medium transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-6px)',
        }}
      >
        {ANNOUNCEMENTS[index]}
      </p>
    </div>
  );
}
