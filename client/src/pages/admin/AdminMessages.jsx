import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, RefreshCw, Search, User, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import axiosInstance from '../../api/axiosInstance';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('admin-msgs-read') || '[]')); }
    catch { return new Set(); }
  });

  async function loadMessages() {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/contact/messages');
      setMessages(data.messages || []);
    } catch {
      // Fallback: load from localStorage if API not available yet
      try {
        const local = JSON.parse(localStorage.getItem('khyathi-contact-messages') || '[]');
        setMessages(local);
      } catch { setMessages([]); }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMessages(); }, []);

  function markRead(id) {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('admin-msgs-read', JSON.stringify([...next]));
      return next;
    });
  }

  const filtered = messages.filter(msg => {
    if (!search) return true;
    return [msg.name, msg.email, msg.phone, msg.message].join(' ').toLowerCase().includes(search.toLowerCase());
  });

  const unreadCount = messages.filter(m => !readIds.has(m.id)).length;

  return (
    <>
      <Helmet><title>Messages | Admin | Khyathi Collections</title></Helmet>
      <section className="min-h-screen bg-[#0A1F44] py-8">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-[18px] border border-white/10 bg-gradient-to-br from-[#102A5A] to-[#0A1F44] p-6 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C8A96B]">Customer inbox</p>
                <h1 className="mt-3 font-heading text-5xl text-white">Contact Messages</h1>
                <p className="mt-1 text-sm text-[#d8c6aa]">
                  {unreadCount > 0 ? <span className="text-maroon font-semibold">{unreadCount} unread · </span> : null}
                  {messages.length} total messages
                </p>
              </div>
              <button type="button" onClick={loadMessages} className="flex items-center gap-2 rounded-full border border-borderwarm bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-cream transition">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="input-shell pl-10"
                  placeholder="Search by name, email, or message..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
              {/* Message list */}
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card-surface p-5 animate-pulse">
                      <div className="h-4 w-1/3 bg-borderwarm rounded-full mb-2" />
                      <div className="h-3 w-1/2 bg-borderwarm rounded-full mb-3" />
                      <div className="h-3 w-full bg-borderwarm rounded-full" />
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div className="card-surface p-14 text-center">
                    <Mail size={36} className="mx-auto text-muted opacity-40 mb-3" />
                    <p className="font-heading text-3xl text-primary">No messages yet</p>
                    <p className="mt-2 text-sm text-muted">Contact form submissions will appear here.</p>
                  </div>
                ) : (
                  filtered.map(msg => {
                    const isRead = readIds.has(msg.id);
                    const isSelected = selected?.id === msg.id;
                    return (
                      <motion.div
                        key={msg.id}
                        layout
                        onClick={() => { setSelected(msg); markRead(msg.id); }}
                        className={`relative card-surface p-5 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-gold' : ''} ${!isRead ? 'border-l-4 border-l-gold' : ''} hover:shadow-md`}
                      >
                        {!isRead && <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-gold" />}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-cream flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-muted" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`font-semibold text-sm ${isRead ? 'text-body' : 'text-primary'}`}>{msg.name || 'Unknown'}</p>
                              <span className="text-[10px] text-muted whitespace-nowrap">{timeAgo(msg.createdAt)}</span>
                            </div>
                            <p className="text-xs text-muted mt-0.5">{msg.email}</p>
                            <p className="text-sm text-body mt-2 line-clamp-2">{msg.message}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Detail panel */}
              <AnimatePresence>
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card-surface p-6 h-fit sticky top-8"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="font-heading text-3xl text-primary">{selected.name}</p>
                        <p className="text-xs uppercase tracking-widest text-muted mt-1">{timeAgo(selected.createdAt)}</p>
                      </div>
                      <button type="button" onClick={() => setSelected(null)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-cream text-muted">
                        <X size={15} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-5">
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-3 rounded-2xl bg-cream p-3 hover:bg-amber-50 transition group">
                        <Mail size={15} className="text-gold" />
                        <span className="text-sm text-primary group-hover:text-gold transition">{selected.email}</span>
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} className="flex items-center gap-3 rounded-2xl bg-cream p-3 hover:bg-amber-50 transition group">
                          <Phone size={15} className="text-gold" />
                          <span className="text-sm text-primary group-hover:text-gold transition">{selected.phone}</span>
                        </a>
                      )}
                    </div>

                    <div className="rounded-2xl bg-cream p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">Message</p>
                      <p className="text-sm text-body leading-7 whitespace-pre-wrap">{selected.message}</p>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <a
                        href={`mailto:${selected.email}?subject=Re: Your enquiry at Khyathi Collections`}
                        className="action-button flex-1 text-center text-sm"
                      >
                        Reply via Email
                      </a>
                      {selected.phone && (
                        <a
                          href={`https://wa.me/91${selected.phone.replace(/\D/g, '').slice(-10)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="action-button-outline flex-1 text-center text-sm"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="hidden lg:flex card-surface items-center justify-center p-14 text-center h-64">
                    <div>
                      <Mail size={28} className="mx-auto text-muted opacity-30 mb-3" />
                      <p className="text-sm text-muted">Select a message to view details</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
