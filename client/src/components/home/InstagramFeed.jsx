import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../ui/Icons';
import { siteConfig } from '../../config/site';

export default function InstagramFeed() {
  return (
    <section className="relative overflow-hidden bg-[#1c120a] py-12 text-white md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.28),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(196,82,107,0.22),transparent_30%)]" />
      <div className="page-shell relative">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_0_42px_rgba(201,168,76,0.35)] backdrop-blur-xl">
            <InstagramIcon className="h-8 w-8 text-[#f6d878]" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">
            {siteConfig.instagramHandle}
          </p>
          <h2 className="mt-3 font-heading text-4xl text-white md:text-6xl">
            Follow on Instagram and get surprise offers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#eadbc5] md:text-base">
            Watch fresh saree drops, jewellery styling reels, customer highlights, and limited-time festive offers first.
          </p>
          <motion.a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ boxShadow: ['0 0 0 rgba(201,168,76,0)', '0 0 34px rgba(201,168,76,0.45)', '0 0 0 rgba(201,168,76,0)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f6d878] px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#1c120a]"
          >
            <Sparkles size={16} />
            Follow & Unlock Offers
          </motion.a>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {['New saree drops', 'Jewellery styling', 'Customer highlights', 'Surprise offers'].map((label, index) => (
            <motion.a
              key={label}
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-[16px] border border-white/15 bg-white/10 p-5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition hover:border-[#C8A96B] hover:bg-white/15"
            >
              <InstagramIcon className="h-5 w-5 text-[#C8A96B]" />
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Follow for curated updates without extra image clutter on the homepage.
              </p>
            </motion.a>
          ))}
        </div>

        <div className="mt-8 rounded-[24px] border border-white/15 bg-white/10 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl md:flex md:items-center md:justify-between">
          <div>
            <p className="font-heading text-3xl text-white">Join WhatsApp Group</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#eadbc5]">
              Get quick product alerts, availability updates, and Narasaropet support directly from our team.
            </p>
          </div>
          <a
            href={siteConfig.whatsappGroupHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-primary md:mt-0"
          >
            <MessageCircle size={17} />
            Join WhatsApp Group
          </a>
        </div>
      </div>
    </section>
  );
}
