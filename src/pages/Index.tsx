
import { useState } from 'react';
import { FaceModel } from '@/components/FaceModel';
import { IngredientDatabase } from '@/components/IngredientDatabase';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-b border-rose-100">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-violet-100/50"></div>
        <div className="relative container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-400 to-violet-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent">
                  SkinGlow
                </h1>
                <p className="text-sm text-gray-600">Your Skincare Ingredient Guide</p>
              </div>
            </div>
            <div className="relative max-w-md w-full ml-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 border-rose-200 focus:border-violet-300 focus:ring-violet-200"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* 3D Face Model Section */}
          <div className="order-2 lg:order-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-rose-400 to-violet-500 rounded-full"></div>
                Interactive Face Model
              </h2>
              <FaceModel />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Click on face areas to discover targeted ingredients
              </p>
            </div>
          </div>

          {/* Ingredient Database Section */}
          <div className="order-1 lg:order-2">
            <IngredientDatabase searchTerm={searchTerm} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
