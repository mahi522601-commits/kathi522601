import { lazy, Suspense, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import AdminRoute from './components/layout/AdminRoute';
import PrivateRoute from './components/layout/PrivateRoute';
import CartDrawer from './components/ui/CartDrawer';
import SearchOverlay from './components/ui/SearchOverlay';
import FloatingSocialBar from './components/ui/FloatingSocialBar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import ChatbotButton from './components/chatbot/ChatbotButton';
import ChatbotPanel from './components/chatbot/ChatbotPanel';
import FestivalBannerOverlay from './components/home/FestivalBannerOverlay';
import InstagramSurprisePopup from './components/ui/InstagramSurprisePopup';
import HyderabadSarees from './pages/seo/HyderabadSarees';
import BangaloreSarees from './pages/seo/BangaloreSarees';
import AndhraPradeshSarees from './pages/seo/AndhraPradeshSarees';
import VijayawadaSarees from './pages/seo/VijayawadaSarees';
import GunturSarees from './pages/seo/GunturSarees';
import OngoleSarees from './pages/seo/OngoleSarees';
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Search = lazy(() => import('./pages/Search'));
const Policies = lazy(() => import('./pages/Policies'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'));

const ADMIN_PATHS = [
  '/admin',
  '/admin/banners',
  '/admin/products',
  '/admin/orders',
  '/admin/coupons',
  '/admin/messages',
];

export default function App() {
  const location = useLocation();
  const isAdmin = ADMIN_PATHS.some((path) => location.pathname.startsWith(path));
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(true);

  return (
    <>
      {!isAdmin && (
        <>
          <AnnouncementBar />
          <Header onOpenSearch={() => setSearchOpen(true)} onOpenCart={() => setCartOpen(true)} />
        </>
      )}

      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Shop />} />
            <Route path="/collections/:category" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/sarees-in-hyderabad" element={<HyderabadSarees />} />
<Route path="/sarees-in-bangalore" element={<BangaloreSarees />} />
<Route path="/sarees-in-andhra-pradesh" element={<AndhraPradeshSarees />} />
<Route path="/sarees-in-vijayawada" element={<VijayawadaSarees />} />
<Route path="/sarees-in-guntur" element={<GunturSarees />} />
<Route path="/sarees-in-ongole" element={<OngoleSarees />} />
            <Route
              path="/receipt/:orderId"
              element={
                <PrivateRoute>
                  <OrderConfirmation />
                </PrivateRoute>
              }
            />
            <Route
              path="/track-order/:orderId"
              element={
                <PrivateRoute>
                  <TrackOrder />
                </PrivateRoute>
              }
            />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
            <Route path="/shipping-policy" element={<Policies type="shipping-policy" />} />
            <Route path="/refund-policy" element={<Policies type="refund-policy" />} />
            <Route path="/privacy-policy" element={<Policies type="privacy-policy" />} />
            <Route path="/terms-of-service" element={<Policies type="terms-of-service" />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/banners"
              element={
                <AdminRoute>
                  <AdminBanners />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <AdminRoute>
                  <AdminCoupons />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <AdminRoute>
                  <AdminMessages />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <BottomNav onOpenSearch={() => setSearchOpen(true)} />
          <FloatingSocialBar />
          <FestivalBannerOverlay />
          <InstagramSurprisePopup />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
          <AnimatePresence>
            {chatOpen ? (
              <ChatbotPanel
                onClose={() => {
                  setChatOpen(false);
                  setChatUnread(false);
                }}
                context={{ page: location.pathname }}
              />
            ) : null}
          </AnimatePresence>
          <ChatbotButton
            onClick={() => {
              setChatOpen((current) => !current);
              setChatUnread(false);
            }}
            hasUnread={chatUnread && !chatOpen}
          />
        </>
      )}
    </>
  );
}
