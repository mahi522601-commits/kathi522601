import { motion } from 'framer-motion';
import { Gift, Heart, Sparkles } from 'lucide-react';
import { InstagramIcon } from '../ui/Icons';
import { siteConfig } from '../../config/site';

export default function InstagramFeed() {
  return (
    <section className="relative overflow-hidden bg-[#1c120a] py-12 text-white md:py-16">
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
            Like, follow Instagram, and get a surprise gift in delivery
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#eadbc5] md:text-base">
            Follow our page after ordering and we will add a small surprise gift with your delivery.
          </p>
          <motion.a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
            animate={{ boxShadow: ['0 0 0 rgba(201,168,76,0)', '0 0 34px rgba(201,168,76,0.45)', '0 0 0 rgba(201,168,76,0)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f6d878] px-7 py-4 text-sm font-bold uppercase tracking-[0.14em] text-[#1c120a]"
          >
            <Heart size={16} />
            Follow Instagram
          </motion.a>
        </motion.div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-5">
            <Sparkles className="text-[#f6d878]" size={20} />
            <p className="mt-3 font-semibold">Fresh drops and reels</p>
          </div>
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-5">
            <Gift className="text-[#f6d878]" size={20} />
            <p className="mt-3 font-semibold">Surprise gift in your parcel</p>
          </div>
        </div>
      </div>
    </section>
  );
}
