
import { FaceModel } from '@/components/FaceModel';
import { OptimizedIngredientDatabase } from '@/components/OptimizedIngredientDatabase';

const Index = () => {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Service Name - White text on black background */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-bold text-white">
          dermodel
        </h1>
      </div>

      {/* 3D Face Model - Positioned on the left side */}
      <div className="fixed left-0 top-0 w-[calc(100vw-420px)] h-screen border-r border-gray-800">
        <FaceModel />
      </div>

      {/* Compact Ingredient Database Overlay - Fixed on the right */}
      <div className="fixed top-0 right-0 w-96 h-screen p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl h-full overflow-hidden mt-16">
          <OptimizedIngredientDatabase />
        </div>
      </div>
    </div>
  );
};

export default Index;
