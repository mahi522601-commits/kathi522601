import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from './Icons';
import { siteConfig } from '../../config/site';

const socials = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: siteConfig.instagramUrl,
    icon: InstagramIcon,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href: siteConfig.youtubeUrl,
    icon: YoutubeIcon,
  },
  {
    id: 'call',
    label: 'Call',
    href: siteConfig.phoneHref,
    icon: PhoneCall,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: siteConfig.whatsappHref,
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20.5 3.6A11.4 11.4 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.2 1.6 6.1L0 24l6.2-1.7c1.8.9 3.8 1.4 5.8 1.4h.1C18.7 23.7 24 18.4 24 11.8c0-3.1-1.2-6.1-3.5-8.2zM12.1 21.7H12c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.6 9.6 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.9-9.8 2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.9 6.9c0 5.4-4.4 9.8-9.8 9.8zm5.4-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.3-.6-.4z" />
      </svg>
    ),
  },
];

export default function FloatingSocialBar() {
  return (
    <div className="pointer-events-none fixed bottom-28 right-3 z-30 flex flex-col items-end gap-3 md:bottom-auto md:right-5 md:top-1/2 md:-translate-y-1/2">
      <motion.a
        href={siteConfig.instagramUrl}
        target="_blank"
        rel="noreferrer"
        whileHover={{ x: -4 }}
        className="pointer-events-auto hidden max-w-[240px] rounded-[1.4rem] border border-white/40 bg-white/45 px-4 py-3 text-right text-xs font-medium leading-5 text-primary shadow-[0_18px_38px_rgba(28,18,10,0.12)] backdrop-blur-xl md:block"
      >
        {siteConfig.socialCta}
      </motion.a>

      <div className="pointer-events-auto flex flex-col gap-2 rounded-[1.8rem] border border-white/45 bg-white/55 p-2 shadow-[0_18px_38px_rgba(28,18,10,0.12)] backdrop-blur-xl">
        {socials.map(({ id, href, icon: Icon, label }) => (
          <motion.a
            key={id}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            animate={{ y: [0, id === 'whatsapp' ? -3 : 0, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: id.length * 0.08 }}
            whileHover={{ x: -3, scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="group flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-primary transition hover:bg-[#1c120a] hover:text-[#f8efe0]"
          >
            <Icon className="h-5 w-5" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
