
import { FaceModel } from '@/components/FaceModel';
import { OptimizedIngredientDatabase } from '@/components/OptimizedIngredientDatabase';

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: 'white' }}>
      {/* Service Name - Black text on white background */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <img src="/favicon.ico" alt="Dermodel" className="w-8 h-8 rounded-md" />
          dermodel
        </h1>
      </div>

      {/* 3D Face Model - Full screen canvas that extends behind table */}
      <div className="fixed inset-0">
        <FaceModel />
      </div>
      {/* Compact Ingredient Database Overlay - Fixed on the right */}
      <div className="fixed top-0 right-0 w-96 h-screen p-4 pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl h-full overflow-hidden pointer-events-auto">
          <OptimizedIngredientDatabase />
        </div>
      </div>
    </div>
  );
};

export default Index;
