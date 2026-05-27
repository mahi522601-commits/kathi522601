import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import {
  DELIVERY_STEPS,
  formatDeliveryDate,
  getCurrentDeliveryStep,
  getDeliveryCountdown,
  getExpectedDeliveryDate,
} from '../../utils/deliveryTracking';

function formatTimelineDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DeliveryTracker({ order, compact = false }) {
  const activeIndex = getCurrentDeliveryStep(order);
  const expectedDate = getExpectedDeliveryDate(order);
  const progress = (activeIndex / (DELIVERY_STEPS.length - 1)) * 100;

  return (
    <div className={`rounded-[22px] border border-[#ead7a2] bg-white/85 p-5 shadow-[0_18px_50px_rgba(82,55,20,0.08)] ${compact ? 'text-sm' : ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
            Expected Delivery Within 5 Days
          </p>
          <h3 className="mt-2 font-heading text-3xl text-primary">
            {formatDeliveryDate(expectedDate)}
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7a2] bg-[#fff6da] px-4 py-2 text-sm font-semibold text-[#8b6724]">
          <Clock size={15} />
          {getDeliveryCountdown(order)}
        </div>
      </div>

      <div className="relative mt-8">
        <div className="absolute left-5 right-5 top-5 hidden h-1 rounded-full bg-[#ead7a2]/60 sm:block" />
        <motion.div
          className="absolute left-5 top-5 hidden h-1 rounded-full bg-gradient-to-r from-[#8b6724] to-[#f6d878] sm:block"
          initial={{ width: 0 }}
          animate={{ width: `calc(${progress}% - ${progress ? '2.5rem' : '0rem'})` }}
        />
        <div className="grid gap-4 sm:grid-cols-5">
          {DELIVERY_STEPS.map((step, index) => {
            const active = index <= activeIndex;
            const current = index === activeIndex;
            return (
              <div key={step} className="relative flex items-center gap-3 sm:block sm:text-center">
                <motion.div
                  animate={current ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ repeat: current ? Infinity : 0, duration: 1.8 }}
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    active
                      ? 'border-[#f6d878] bg-[#1c120a] text-[#f6d878] shadow-[0_0_26px_rgba(246,216,120,0.45)]'
                      : 'border-[#ead7a2] bg-[#fbf5e8] text-muted'
                  }`}
                >
                  {active ? <Check size={16} /> : index + 1}
                </motion.div>
                <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-muted'} sm:mt-3`}>
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-7 space-y-3 border-t border-[#ead7a2] pt-5">
        {(order?.statusHistory || []).map((entry, index) => (
          <div key={`${entry.status}-${entry.at}-${index}`} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
            <div>
              <p className="text-sm font-semibold text-primary">{entry.label || entry.status}</p>
              <p className="text-xs text-muted">{formatTimelineDate(entry.at || order.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
