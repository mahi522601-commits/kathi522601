import { Link } from 'react-router-dom';
import { MapPin, PhoneCall } from 'lucide-react';
import { footerLinks } from '../../utils/constants';
import { InstagramIcon, YoutubeIcon } from '../ui/Icons';
import BrandLogo from '../ui/BrandLogo';
import { siteConfig } from '../../config/site';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#2a170b] pb-24 text-white md:pb-0">
      <div className="page-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1.2fr]">
          <div>
            <div className="flex items-center gap-4">
              <BrandLogo size="md" className="h-16 w-16" />
              <div>
                <p className="font-heading text-2xl tracking-[0.12em]">KHYATHI COLLECTIONS</p>
                <p className="mt-2 max-w-sm text-sm text-[#dbc9b3]">
                  Khyathi Collections curates premium sarees, jewellery, and occasion-ready edits
                  with a refined feminine point of view.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="font-heading text-2xl">Policies</p>
            <div className="mt-4 grid gap-3 text-sm text-[#dbc9b3]">
              {footerLinks.policies.map((item) => (
                <Link key={item.path} to={item.path} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-heading text-2xl">Customer Services</p>
            <div className="mt-4 grid gap-3 text-sm text-[#dbc9b3]">
              {footerLinks.services.map((item) => (
                <Link key={item.path} to={item.path} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-heading text-2xl">Contact & Follow</p>
            <div className="mt-4 space-y-4 text-sm text-[#dbc9b3]">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-gold" />
                <div>
                  <p className="font-semibold text-white">{siteConfig.location}</p>
                  <p>Visit or connect with us for styling help and festive edits.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneCall size={18} className="mt-0.5 text-gold" />
                <div>
                  <a
                    href={siteConfig.phoneHref}
                    className="font-semibold text-white transition hover:text-gold"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                  <p className="mt-1">
                    Call for saree guidance, delivery questions, or order support.
                  </p>
                </div>
              </div>
            </div>
            <a
              href={siteConfig.whatsappGroupHref}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold tracking-[0.08em] text-primary transition hover:bg-[#efe4d6]"
            >
              Join WhatsApp Group
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-[#dbc9b3] md:flex-row">
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              <InstagramIcon />
            </a>
            <a
              href={siteConfig.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              <YoutubeIcon />
            </a>
          </div>
          <p>Website made by WayzenTech 9398724704</p>
          <p>&copy; 2025, KHYATHI COLLECTIONS</p>
        </div>
      </div>
    </footer>
  );
}
