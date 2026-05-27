import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/admin/AdminSidebar';
import CouponForm from '../../components/admin/CouponForm';
import { deleteCoupon, getCoupons, saveCoupon } from '../../firebase/couponService';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getCoupons().then(setCoupons).catch(() => {
      //
    });
  }, []);

  async function handleSave(coupon) {
    try {
      const response = await saveCoupon(coupon);
      setCoupons((current) => {
        const exists = current.some((entry) => entry.code === response.code);
        return exists ? current.map((entry) => (entry.code === response.code ? response : entry)) : [response, ...current];
      });
      setShowForm(false);
      setEditingCoupon(null);
      toast.success('Coupon saved');
    } catch (error) {
      toast.error(error.message || 'Unable to save coupon');
    }
  }

  async function handleDelete(code) {
    if (!window.confirm('Delete this coupon?')) {
      return;
    }

    try {
      await deleteCoupon(code);
      setCoupons((current) => current.filter((coupon) => coupon.code !== code));
      toast.success('Coupon deleted');
    } catch (error) {
      toast.error(error.message || 'Unable to delete coupon');
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Coupons | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#120b07] py-8">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-8">
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24140a] to-[#140b06] p-6 text-white md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">Promotion desk</p>
                <h1 className="mt-3 font-heading text-5xl text-white">Coupons</h1>
                <p className="mt-2 text-sm text-[#d8c6aa]">Create discount codes and manage promotions.</p>
              </div>
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  setEditingCoupon(null);
                  setShowForm((current) => !current);
                }}
              >
                {showForm ? 'Close Form' : 'Add Coupon'}
              </button>
            </div>

            {showForm ? (
              <div className="card-surface p-6 md:p-8">
                <CouponForm
                  coupon={editingCoupon}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingCoupon(null);
                  }}
                />
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[1.5rem] border border-borderwarm bg-white">
              <div className="overflow-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="px-4 py-4 font-semibold text-primary">Code</th>
                      <th className="px-4 py-4 font-semibold text-primary">Discount%</th>
                      <th className="px-4 py-4 font-semibold text-primary">Min Order</th>
                      <th className="px-4 py-4 font-semibold text-primary">Expires</th>
                      <th className="px-4 py-4 font-semibold text-primary">Active</th>
                      <th className="px-4 py-4 font-semibold text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.code} className="border-t border-borderwarm">
                        <td className="px-4 py-4 font-semibold text-primary">{coupon.code}</td>
                        <td className="px-4 py-4">{coupon.discount}%</td>
                        <td className="px-4 py-4">{coupon.minOrderValue}</td>
                        <td className="px-4 py-4">{coupon.expiresAt}</td>
                        <td className="px-4 py-4">{coupon.active ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-borderwarm px-3 py-2 text-primary"
                              onClick={() => {
                                setEditingCoupon(coupon);
                                setShowForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-borderwarm px-3 py-2 text-maroon"
                              onClick={() => handleDelete(coupon.code)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
