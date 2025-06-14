
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
                <p className="text-sm text-gray-600">Your Interactive Skincare Guide</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main 3D Face Model Section */}
          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Interactive Face Model
                </h2>
                <p className="text-gray-600">
                  Click on different areas of the face to discover targeted skincare ingredients
                </p>
              </div>
              <FaceModel />
            </div>
          </div>

          {/* Ingredient Database Sidebar */}
          <div className="w-80">
            <div className="mb-4">
              <div className="relative">
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
            <IngredientDatabase searchTerm={searchTerm} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
