
import { useState } from 'react';
import { FaceModel } from '@/components/FaceModel';
import { IngredientDatabase } from '@/components/IngredientDatabase';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      {/* Service Name */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent">
          dermodel
        </h1>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main 3D Face Model Section */}
          <div className="flex-1">
            <FaceModel />
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
