import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarClock, Loader2, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSiteSettings, saveSiteSettings } from '../../firebase/settingsService';
import { isBannerScheduled, resolveBannerImage } from '../../utils/bannerScheduling';
import ImageUploader from './ImageUploader';

const blankBanner = {
  title: '',
  subtitle: '',
  redirectUrl: '/collections',
  startDate: '',
  endDate: '',
  active: true,
  image: null,
};

function BannerPreview({ banner, mode = 'mobile' }) {
  const imageUrl = resolveBannerImage(banner.image);
  const frameClass =
    mode === 'mobile'
      ? 'mx-auto h-[460px] max-w-[240px] rounded-[30px]'
      : 'h-[260px] w-full rounded-[22px]';

  return (
    <div className={`relative overflow-hidden border border-[#ead7a2] bg-[#120b07] shadow-[0_18px_48px_rgba(42,29,16,0.16)] ${frameClass}`}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c120a] to-[#6f5428]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/25" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6d878]">Festival Banner</p>
        <h4 className="mt-2 font-heading text-3xl leading-none">{banner.title || 'Banner title'}</h4>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/75">{banner.subtitle || 'Banner subtitle preview'}</p>
      </div>
    </div>
  );
}

export default function FestivalBannersManager() {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(blankBanner);
  const [draftImages, setDraftImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSiteSettings()
      .then((response) => {
        if (mounted) {
          setSettings(response);
        }
      })
      .catch(() => toast.error('Unable to load festival banners'))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function addBanner() {
    const image = draftImages[0] || draft.image;
    if (!draft.title.trim()) {
      toast.error('Banner title is required');
      return;
    }
    if (!image) {
      toast.error('Upload a fullscreen banner image');
      return;
    }
    if (draft.startDate && draft.endDate && new Date(draft.startDate) > new Date(draft.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const banner = {
      ...draft,
      id: `festival-banner-${Date.now()}`,
      image,
      createdAt: new Date().toISOString(),
    };
    setSettings((current) => ({
      ...current,
      festivalBanners: [...(current?.festivalBanners || []), banner],
    }));
    setDraft(blankBanner);
    setDraftImages([]);
    toast.success('Festival banner added');
  }

  function updateBanner(index, patch) {
    setSettings((current) => ({
      ...current,
      festivalBanners: current.festivalBanners.map((banner, bannerIndex) =>
        bannerIndex === index ? { ...banner, ...patch } : banner,
      ),
    }));
  }

  function moveBanner(index, direction) {
    setSettings((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.festivalBanners.length) {
        return current;
      }
      const next = [...current.festivalBanners];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return { ...current, festivalBanners: next };
    });
  }

  function deleteBanner(index) {
    setSettings((current) => ({
      ...current,
      festivalBanners: current.festivalBanners.filter((_, bannerIndex) => bannerIndex !== index),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await saveSiteSettings(settings);
      setSettings(saved);
      toast.success('Festival banners saved');
    } catch (error) {
      toast.error(error.message || 'Unable to save banners');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[24px] bg-white p-6 text-primary">
        <Loader2 className="mr-2 inline animate-spin text-gold" size={18} />
        Loading festival banner manager...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24140a] to-[#140b06] p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">
              <CalendarClock size={14} />
              Festival Banner Management
            </p>
            <h1 className="mt-3 font-heading text-5xl text-white">Fullscreen Festival Banners</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8c6aa]">
              Upload cinematic fullscreen banners, schedule start and end dates, preview mobile and desktop frames, and let the storefront auto activate them.
            </p>
          </div>
          <button type="button" className="action-button gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Banners
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] border border-borderwarm bg-[#fffaf0] p-5 text-primary">
          <h2 className="font-heading text-3xl">Create Banner</h2>
          <div className="mt-5 space-y-4">
            <input className="input-shell" placeholder="Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea className="w-full rounded-[1.4rem] border border-borderwarm bg-white p-4 text-sm outline-none" rows="3" placeholder="Subtitle" value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
            <input className="input-shell" placeholder="Redirect link, for example /collections/sarees" value={draft.redirectUrl} onChange={(event) => setDraft({ ...draft, redirectUrl: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Start date
                <input type="date" className="input-shell mt-2" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                End date
                <input type="date" className="input-shell mt-2" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} />
              </label>
            </div>
            <label className="inline-flex items-center gap-3 rounded-full border border-borderwarm bg-white px-4 py-3 text-sm font-semibold">
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
              Enable banner
            </label>
            <ImageUploader value={draftImages} onChange={setDraftImages} productName="festival-banner" />
            <button type="button" className="action-button w-full" onClick={addBanner}>
              Add Festival Banner
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-borderwarm bg-white p-5 text-primary">
          <h2 className="font-heading text-3xl">Responsive Preview</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
            <BannerPreview banner={{ ...draft, image: draftImages[0] }} mode="mobile" />
            <BannerPreview banner={{ ...draft, image: draftImages[0] }} mode="desktop" />
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-borderwarm bg-white p-5 text-primary">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl">Scheduled Banners</h2>
            <p className="text-sm text-muted">First active scheduled banner appears fullscreen on the storefront.</p>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {settings?.festivalBanners?.length || 0} banners
          </span>
        </div>

        <div className="mt-5 grid gap-4">
          {settings?.festivalBanners?.length ? settings.festivalBanners.map((banner, index) => (
            <div key={banner.id} className="grid gap-4 rounded-[22px] border border-borderwarm bg-cream/60 p-4 lg:grid-cols-[180px_1fr]">
              <BannerPreview banner={banner} mode="mobile" />
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="input-shell" value={banner.title} onChange={(event) => updateBanner(index, { title: event.target.value })} />
                  <input className="input-shell" value={banner.redirectUrl} onChange={(event) => updateBanner(index, { redirectUrl: event.target.value })} />
                </div>
                <textarea className="w-full rounded-[1.4rem] border border-borderwarm bg-white p-4 text-sm outline-none" rows="2" value={banner.subtitle} onChange={(event) => updateBanner(index, { subtitle: event.target.value })} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input type="date" className="input-shell" value={banner.startDate || ''} onChange={(event) => updateBanner(index, { startDate: event.target.value })} />
                  <input type="date" className="input-shell" value={banner.endDate || ''} onChange={(event) => updateBanner(index, { endDate: event.target.value })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${banner.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`} onClick={() => updateBanner(index, { active: !banner.active })}>
                    {banner.active ? 'Enabled' : 'Disabled'}
                  </button>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${isBannerScheduled(banner) ? 'bg-[#fff6da] text-[#8b6724]' : 'bg-slate-100 text-slate-600'}`}>
                    {isBannerScheduled(banner) ? 'Live by schedule' : 'Not live now'}
                  </span>
                  <button type="button" className="rounded-full border border-borderwarm px-4 py-2 text-sm" onClick={() => moveBanner(index, -1)} disabled={index === 0}>
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" className="rounded-full border border-borderwarm px-4 py-2 text-sm" onClick={() => moveBanner(index, 1)} disabled={index === settings.festivalBanners.length - 1}>
                    <ArrowDown size={14} />
                  </button>
                  <button type="button" className="inline-flex items-center gap-2 rounded-full border border-borderwarm px-4 py-2 text-sm text-maroon" onClick={() => deleteBanner(index)}>
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <BannerPreview banner={banner} mode="mobile" />
                  <BannerPreview banner={banner} mode="desktop" />
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-[20px] border border-dashed border-borderwarm bg-cream p-8 text-center text-muted">
              No festival banners yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
