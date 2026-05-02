import React, { useState } from 'react';
import { Layers, Plus, Search, AlertTriangle, Edit2, ShoppingCart } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/animations/FadeIn';
import { useAdminStore } from '../../store/adminStore';

export default function ManagerMaterial() {
  const { materials, fetchMaterials } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Material (BoM)</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau stok bahan baku dan tinta untuk produksi.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <ShoppingCart size={18} className="mr-2" /> Restock
          </Button>
          <Button className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700">
            <Plus size={18} className="mr-2" /> Material Baru
          </Button>
        </div>
      </div>

      <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari bahan baku..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="warning" className="cursor-pointer">Perlu Restock (2)</Badge>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-medium">ID Material</th>
                <th className="px-6 py-4 font-medium">Nama Material</th>
                <th className="px-6 py-4 font-medium">Sisa Stok</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((item) => {
                  const isLow = item.stock <= 10; // Threshold default 10
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Layers size={16} className={isLow ? 'text-red-500' : 'text-slate-400'} />
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            <AlertTriangle size={14} /> Kritis
                          </span>
                        ) : (
                          <Badge variant="success">Aman</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Material tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </FadeIn>

    </div>
  );
}
