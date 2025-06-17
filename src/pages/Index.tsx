
import { useState } from 'react';
import { FaceModel } from '@/components/FaceModel';
import { NewIngredientDatabase } from '@/components/NewIngredientDatabase';
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

          {/* New Ingredient Database Sidebar */}
          <div className="w-96">
            <NewIngredientDatabase />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
