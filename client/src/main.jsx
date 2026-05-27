import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/pagination';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
      <ScrollToTop />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1C120A',
                    color: '#FAF7F2',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    border: '1px solid rgba(201,168,76,0.25)',
                    boxShadow: '0 12px 30px rgba(28,18,10,0.18)',
                  },
                }}
              />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
