import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, MessageSquare, Phone } from 'lucide-react';
import contactApi from '../api/contactApi';
import { siteConfig } from '../config/site';
import SEO from '../components/SEO';

function saveMessageLocally(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem('khyathi-contact-messages') || '[]');
    const message = {
      id: `msg-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString(),
      read: false,
    };
    localStorage.setItem(
      'khyathi-contact-messages',
      JSON.stringify([message, ...existing].slice(0, 100)),
    );
  } catch {
    // Ignore local persistence failures and keep the contact flow uninterrupted.
  }
}

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: siteConfig.phoneDisplay,
    href: siteConfig.phoneHref,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: siteConfig.location,
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await contactApi.submit(form);
    } catch {
      // API failure should not block local admin visibility for customer messages.
    }

    saveMessageLocally(form);
    toast.success("Message sent! We'll get back to you soon.");
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setSaving(false);
  }

  return (
    <>
      <SEO
  title="Contact Khyathi Collections | Saree Store"
  description="Contact Khyathi Collections for premium sarees, bridal sarees, silk sarees, and traditional collections in Hyderabad and Andhra Pradesh."
  keywords="contact saree shop, Hyderabad sarees, Andhra sarees"
  image="https://khyathicollections.com/banner.jpg"
  url="https://khyathicollections.com/contact"
/>
      <section className="section-block">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gold-dark">Contact Us</p>
              <h1 className="mt-4 font-heading text-5xl text-primary">
                Let&apos;s talk about your next look
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-body md:text-base">
                Reach out for order support, bulk enquiries, styling help, or jewellery
                consultations. We&apos;re happy to help find the perfect piece for your occasion.
              </p>

              <div className="mt-8 space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 rounded-2xl border border-borderwarm bg-white p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cream">
                      <Icon size={18} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-semibold text-primary transition hover:text-gold"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-primary">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-5 py-4 text-white transition hover:bg-[#1ebe5d] hover:shadow-lg"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 flex-shrink-0">
                    <path d="M20.5 3.6A11.4 11.4 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.2 1.6 6.1L0 24l6.2-1.7c1.8.9 3.8 1.4 5.8 1.4h.1C18.7 23.7 24 18.4 24 11.8c0-3.1-1.2-6.1-3.5-8.2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
                      Chat with us
                    </p>
                    <p className="text-sm font-bold">Message on WhatsApp</p>
                  </div>
                </a>
                <a
                  href={siteConfig.phoneHref}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-borderwarm bg-white px-5 py-4 text-primary transition hover:border-gold hover:text-gold"
                >
                  <Phone size={20} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                      Talk to us
                    </p>
                    <p className="text-sm font-bold">Call Now</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="card-surface p-6 md:p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <MessageSquare size={28} className="text-emerald-600" />
                  </div>
                  <p className="font-heading text-4xl text-primary">Message Sent!</p>
                  <p className="mt-3 max-w-xs text-sm text-muted">
                    Thank you for reaching out. Our team will respond within 24 hours.
                  </p>
                  <button
                    type="button"
                    className="action-button mt-7"
                    onClick={() => setSent(false)}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <>
                  <h2 className="mb-6 font-heading text-3xl text-primary">Send a Message</h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                          Your Name *
                        </label>
                        <input
                          className="input-shell"
                          placeholder="e.g. Priya Sharma"
                          value={form.name}
                          onChange={(event) => setForm({ ...form, name: event.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                          Phone Number
                        </label>
                        <input
                          className="input-shell"
                          placeholder="10-digit number"
                          value={form.phone}
                          onChange={(event) => setForm({ ...form, phone: event.target.value })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className="input-shell"
                          placeholder="your@email.com"
                          value={form.email}
                          onChange={(event) => setForm({ ...form, email: event.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                          Message *
                        </label>
                        <textarea
                          className="w-full rounded-[1.6rem] border border-borderwarm bg-[#f7f1e8] p-4 text-sm text-body outline-none transition placeholder:text-[#a8937b] focus:border-gold focus:bg-white"
                          rows="5"
                          placeholder="Tell us about the saree or jewellery style you are looking for, the occasion, and your preferred budget."
                          value={form.message}
                          onChange={(event) => setForm({ ...form, message: event.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="action-button w-full py-4 text-base" disabled={saving}>
                      {saving ? 'Sending...' : 'Send Message'}
                    </button>
                    <p className="text-center text-xs text-muted">
                      We typically respond within 24 hours.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
