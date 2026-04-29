import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';
import { StaggerContainer } from '../../components/animations/StaggerContainer';
import BackButton from '../../components/ui/BackButton';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <BackButton />
        </div>

        <FadeIn className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center">
            <Heart size={24} className="fill-rose-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Wishlist Saya</h1>
            <p className="text-slate-500">Produk yang Anda simpan untuk dibeli nanti</p>
          </div>
        </FadeIn>

        {items.length === 0 ? (
          <FadeIn delay={0.1} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Wishlist Masih Kosong</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Anda belum menyimpan produk apapun. Yuk, jelajahi katalog kami dan temukan produk cetak yang Anda butuhkan!
            </p>
            <Link to="/katalog">
              <Button size="lg" className="shadow-lg shadow-primary-500/30">
                Mulai Belanja <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
