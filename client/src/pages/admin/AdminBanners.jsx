import { Helmet } from 'react-helmet-async';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FestivalBannersManager from '../../components/admin/FestivalBannersManager';

export default function AdminBanners() {
  return (
    <>
      <Helmet>
        <title>Admin Banners | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#120b07] py-8">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <FestivalBannersManager />
        </div>
      </section>
    </>
  );
}
