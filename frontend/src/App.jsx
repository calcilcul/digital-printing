import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useProductStore } from './store/productStore';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import StaffLayout from './layouts/StaffLayout';
import ManagerLayout from './layouts/ManagerLayout';

// Error Page
import NotFound from './pages/NotFound';

// Pages (Customer)
import LandingPage from './pages/customer/LandingPage';
import CatalogPage from './pages/customer/CatalogPage';
import ProductDetail from './pages/customer/ProductDetail';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderListPage from './pages/customer/OrderListPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import ProfilePage from './pages/customer/ProfilePage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import FaqPage from './pages/customer/FaqPage';
import TermsPage from './pages/customer/TermsPage';
import PrivacyPage from './pages/customer/PrivacyPage';
import CaraPemesananPage from './pages/customer/CaraPemesananPage';
import WishlistPage from './pages/customer/WishlistPage';
import CarePage from './pages/customer/CarePage';

// Pages (Staff)
import StaffDashboard from './pages/staff/StaffDashboard';
import OrderVerification from './pages/staff/OrderVerification';
import StaffVerificationList from './pages/staff/StaffVerificationList';
import StaffNotifications from './pages/staff/StaffNotifications';

// Pages (Manager)
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ProductManagement from './pages/manager/ProductManagement';
import ManagerMaterial from './pages/manager/ManagerMaterial';
import ManagerMonitoring from './pages/manager/ManagerMonitoring';

import IntroLoader from './components/animations/IntroLoader';

// Simple placeholder page for now
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);

function App() {
  // Use session storage so loader only plays once per browser session
  const [isAppReady, setIsAppReady] = React.useState(
    () => sessionStorage.getItem('jaya_intro_played') === 'true'
  );

  const { fetchProducts } = useProductStore();

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleIntroComplete = () => {
    sessionStorage.setItem('jaya_intro_played', 'true');
    setIsAppReady(true);
  };

  return (
    <ErrorBoundary>
      <LazyMotion features={domAnimation} strict>
        {!isAppReady && <IntroLoader onComplete={handleIntroComplete} />}
        
        {isAppReady && (
          <BrowserRouter>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="katalog" element={<CatalogPage />} />
              <Route path="produk/:id" element={<ProductDetail />} />
              <Route path="keranjang" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="pesanan" element={<OrderListPage />} />
              <Route path="pesanan/:id" element={<OrderDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="tentang" element={<AboutPage />} />
              <Route path="kontak" element={<ContactPage />} />
              <Route path="faq" element={<CarePage />} />
              <Route path="care" element={<CarePage />} />
              <Route path="cara-order" element={<CaraPemesananPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="syarat-ketentuan" element={<TermsPage />} />
              <Route path="kebijakan-privasi" element={<PrivacyPage />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboard />} />
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="verifikasi" element={<StaffVerificationList />} />
              <Route path="verifikasi/:id" element={<OrderVerification />} />
              <Route path="notifikasi" element={<StaffNotifications />} />
              <Route path="produksi" element={<Placeholder title="Antrean Produksi" />} />
            </Route>

            {/* Manager Routes */}
            <Route path="/manager" element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="produk" element={<ProductManagement />} />
              <Route path="login" element={<Placeholder title="Manager Login" />} />
              <Route path="material" element={<ManagerMaterial />} />
              <Route path="laporan" element={<Placeholder title="Laporan Omzet" />} />
              <Route path="monitoring" element={<ManagerMonitoring />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        )}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </LazyMotion>
    </ErrorBoundary>
  );
}

export default App;
