import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Star, Users } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import HeroSlidesManager from '../../components/admin/HeroSlidesManager';
import { getOrders } from '../../firebase/ordersService';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/formatPrice';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sumOrdersByMonth(orders) {
  const months = monthLabels.map((label) => ({ label, value: 0, orders: 0 }));
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = date.getMonth();
    months[month].value += Number(order.total || 0);
    months[month].orders += 1;
  });
  return months;
}

function MiniBarChart({ data, valueFormatter = (value) => value }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-64 items-end gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
      {data.map((item) => (
        <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${Math.max((item.value / max) * 100, item.value ? 8 : 3)}%` }}
            viewport={{ once: true }}
            className="rounded-t-full bg-gradient-to-t from-[#a07830] to-[#f6d878]"
            title={`${item.label}: ${valueFormatter(item.value)}`}
          />
          <span className="text-center text-[10px] font-semibold uppercase text-[#d8c6aa]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBars({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#e9d6b8]">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / max) * 100}%` }}
              viewport={{ once: true }}
              className="h-full rounded-full bg-[#f6d878]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { products } = useProducts();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => {
      //
    });
  }, []);

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const customers = new Set(orders.map((order) => order.email || order.phone).filter(Boolean)).size;
    const deliveredOrders = orders.filter((order) => (order.deliveryStatus || order.status) === 'Delivered').length;
    const pendingOrders = orders.filter((order) => (order.deliveryStatus || order.status) !== 'Delivered').length;
    const monthlyRevenue = sumOrdersByMonth(orders);
    const yearlyRevenue = Object.values(
      orders.reduce((accumulator, order) => {
        const year = new Date(order.createdAt).getFullYear();
        accumulator[year] = accumulator[year] || { label: String(year), value: 0 };
        accumulator[year].value += Number(order.total || 0);
        return accumulator;
      }, {}),
    );
    const categories = Object.values(
      products.reduce((accumulator, product) => {
        accumulator[product.category] = accumulator[product.category] || {
          label: product.category,
          value: 0,
        };
        accumulator[product.category].value += 1;
        return accumulator;
      }, {}),
    );
    const topProducts = [...products]
      .sort((left, right) => (right.soldCount || 0) - (left.soldCount || 0))
      .slice(0, 5);
    const reviewsScore = products.reduce((sum, product) => sum + Number(product.rating || 4.7), 0) / Math.max(products.length, 1);
    const paymentAnalytics = Object.values(
      orders.reduce((accumulator, order) => {
        const status = order.paymentStatus || 'Pending';
        accumulator[status] = accumulator[status] || { label: status, value: 0 };
        accumulator[status].value += 1;
        return accumulator;
      }, {}),
    );

    return {
      revenue,
      customers,
      deliveredOrders,
      pendingOrders,
      monthlyRevenue,
      yearlyRevenue: yearlyRevenue.length ? yearlyRevenue : [{ label: String(new Date().getFullYear()), value: revenue }],
      categories,
      topProducts,
      reviewsScore,
      paymentAnalytics,
    };
  }, [orders, products]);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(analytics.revenue), icon: Star },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
    { label: 'Total Customers', value: analytics.customers, icon: Users },
    { label: 'Delivered Orders', value: analytics.deliveredOrders, icon: Package },
    { label: 'Pending Orders', value: analytics.pendingOrders, icon: ShoppingBag },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Khyathi Collections</title>
      </Helmet>
      <section className="min-h-screen bg-[#120b07] py-8 text-white">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-8">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#24140a] to-[#140b06] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f6d878]">Luxury commerce command</p>
              <h1 className="mt-3 font-heading text-5xl text-white">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#d8c6aa]">
                Track revenue, orders, categories, reviews, and recent activity from one polished admin view.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {stats.map(({ label, value, icon: Icon }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[22px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#f6d878]">{label}</p>
                    <Icon size={20} className="text-[#f6d878]" />
                  </div>
                  <p className="mt-3 font-heading text-4xl text-white">{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Monthly Sales Amount</h2>
                <p className="mb-5 mt-1 text-sm text-[#d8c6aa]">Animated month-by-month revenue view.</p>
                <MiniBarChart data={analytics.monthlyRevenue} valueFormatter={formatPrice} />
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Product Category Analytics</h2>
                <p className="mb-5 mt-1 text-sm text-[#d8c6aa]">Catalog spread by category.</p>
                <HorizontalBars data={analytics.categories} />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Payment Analytics</h2>
                <p className="mb-5 mt-1 text-sm text-[#d8c6aa]">Paid, pending, and failed payment distribution.</p>
                <HorizontalBars data={analytics.paymentAnalytics.length ? analytics.paymentAnalytics : [{ label: 'No payments', value: 0 }]} />
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Order Trends</h2>
                <p className="mb-5 mt-1 text-sm text-[#d8c6aa]">Monthly order count across the year.</p>
                <MiniBarChart data={analytics.monthlyRevenue.map((month) => ({ label: month.label, value: month.orders }))} />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5 xl:col-span-2">
                <h2 className="font-heading text-3xl text-white">Yearly Revenue Graph</h2>
                <p className="mb-5 mt-1 text-sm text-[#d8c6aa]">Annual revenue comparison.</p>
                <MiniBarChart data={analytics.yearlyRevenue} valueFormatter={formatPrice} />
              </div>
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Reviews Analytics</h2>
                <div className="mt-7 rounded-[22px] border border-[#f6d878]/20 bg-[#f6d878]/10 p-6 text-center">
                  <p className="font-heading text-6xl text-[#f6d878]">{analytics.reviewsScore.toFixed(1)}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#eadbc5]">Average rating</p>
                  <p className="mt-5 text-sm leading-6 text-[#d8c6aa]">
                    Based on product signals and default storefront confidence where reviews are unavailable.
                  </p>
                </div>
              </div>
            </div>

            <HeroSlidesManager products={products} />

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[24px] border border-white/10 bg-[#1c120a] p-5">
                <h2 className="font-heading text-3xl text-white">Top Selling Products</h2>
                <div className="mt-5 space-y-3">
                  {analytics.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 rounded-[16px] bg-white/[0.06] p-3">
                      <img src={product.thumbnails?.[0] || product.images?.[0]} alt={product.name} className="h-14 w-12 rounded-[10px] object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-[#d8c6aa]">{product.category}</p>
                      </div>
                      <p className="text-xs font-semibold text-[#f6d878]">{product.soldCount || 0} sold</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#1c120a]">
                <div className="border-b border-white/10 px-6 py-5">
                  <h2 className="font-heading text-3xl text-white">Recent Orders</h2>
                </div>
                <div className="overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/[0.06] text-[#f6d878]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Order ID</th>
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map((order) => (
                        <tr key={order.id} className="border-t border-white/10 text-[#eadbc5]">
                          <td className="px-6 py-4 font-semibold text-white">{order.orderNumber}</td>
                          <td className="px-6 py-4">{order.customerName}</td>
                          <td className="px-6 py-4">{formatPrice(order.total)}</td>
                          <td className="px-6 py-4">{order.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
