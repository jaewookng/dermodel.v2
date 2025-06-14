
import { useState } from 'react';
import { Card } from '@/components/ui/card';

type FaceArea = 'forehead' | 'eyes' | 'cheeks' | 'nose' | 'lips' | 'chin' | null;

const areaInfo = {
  forehead: {
    title: 'Forehead',
    concerns: ['Fine lines', 'Oil control', 'Texture'],
    ingredients: ['Retinol', 'Niacinamide', 'Salicylic Acid']
  },
  eyes: {
    title: 'Eye Area',
    concerns: ['Dark circles', 'Puffiness', 'Crow\'s feet'],
    ingredients: ['Caffeine', 'Peptides', 'Hyaluronic Acid']
  },
  cheeks: {
    title: 'Cheeks',
    concerns: ['Dryness', 'Redness', 'Loss of firmness'],
    ingredients: ['Ceramides', 'Vitamin C', 'Collagen']
  },
  nose: {
    title: 'Nose',
    concerns: ['Blackheads', 'Large pores', 'Oiliness'],
    ingredients: ['BHA', 'Charcoal', 'Clay']
  },
  lips: {
    title: 'Lips',
    concerns: ['Dryness', 'Fine lines', 'Pigmentation'],
    ingredients: ['Shea Butter', 'Vitamin E', 'Peptides']
  },
  chin: {
    title: 'Chin',
    concerns: ['Acne', 'Texture', 'Sensitivity'],
    ingredients: ['Tea Tree', 'Zinc', 'Allantoin']
  }
};

export const FaceModel = () => {
  const [activeArea, setActiveArea] = useState<FaceArea>(null);
  const [hoveredArea, setHoveredArea] = useState<FaceArea>(null);

  const handleAreaClick = (area: FaceArea) => {
    setActiveArea(activeArea === area ? null : area);
  };

  return (
    <div className="space-y-6">
      {/* SVG Face Model */}
      <div className="relative mx-auto w-64 h-80 bg-gradient-to-b from-rose-50 to-violet-50 rounded-3xl p-4 shadow-inner">
        <svg
          viewBox="0 0 200 250"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
        >
          {/* Face outline */}
          <ellipse
            cx="100"
            cy="140"
            rx="70"
            ry="85"
            fill="#fef7f0"
            stroke="#f3d5c0"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          
          {/* Forehead area */}
          <ellipse
            cx="100"
            cy="80"
            rx="50"
            ry="25"
            fill={hoveredArea === 'forehead' || activeArea === 'forehead' ? '#fce7f3' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-rose-100"
            onClick={() => handleAreaClick('forehead')}
            onMouseEnter={() => setHoveredArea('forehead')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Eye areas */}
          <ellipse
            cx="80"
            cy="115"
            rx="15"
            ry="10"
            fill={hoveredArea === 'eyes' || activeArea === 'eyes' ? '#e0e7ff' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-blue-100"
            onClick={() => handleAreaClick('eyes')}
            onMouseEnter={() => setHoveredArea('eyes')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          <ellipse
            cx="120"
            cy="115"
            rx="15"
            ry="10"
            fill={hoveredArea === 'eyes' || activeArea === 'eyes' ? '#e0e7ff' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-blue-100"
            onClick={() => handleAreaClick('eyes')}
            onMouseEnter={() => setHoveredArea('eyes')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Cheek areas */}
          <ellipse
            cx="65"
            cy="140"
            rx="20"
            ry="25"
            fill={hoveredArea === 'cheeks' || activeArea === 'cheeks' ? '#fef3c7' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-yellow-100"
            onClick={() => handleAreaClick('cheeks')}
            onMouseEnter={() => setHoveredArea('cheeks')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          <ellipse
            cx="135"
            cy="140"
            rx="20"
            ry="25"
            fill={hoveredArea === 'cheeks' || activeArea === 'cheeks' ? '#fef3c7' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-yellow-100"
            onClick={() => handleAreaClick('cheeks')}
            onMouseEnter={() => setHoveredArea('cheeks')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Nose area */}
          <ellipse
            cx="100"
            cy="135"
            rx="12"
            ry="20"
            fill={hoveredArea === 'nose' || activeArea === 'nose' ? '#d1fae5' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-green-100"
            onClick={() => handleAreaClick('nose')}
            onMouseEnter={() => setHoveredArea('nose')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Lips area */}
          <ellipse
            cx="100"
            cy="165"
            rx="18"
            ry="8"
            fill={hoveredArea === 'lips' || activeArea === 'lips' ? '#fce7f3' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-pink-100"
            onClick={() => handleAreaClick('lips')}
            onMouseEnter={() => setHoveredArea('lips')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Chin area */}
          <ellipse
            cx="100"
            cy="190"
            rx="25"
            ry="20"
            fill={hoveredArea === 'chin' || activeArea === 'chin' ? '#f3e8ff' : 'transparent'}
            className="cursor-pointer transition-all duration-300 hover:fill-purple-100"
            onClick={() => handleAreaClick('chin')}
            onMouseEnter={() => setHoveredArea('chin')}
            onMouseLeave={() => setHoveredArea(null)}
          />
          
          {/* Facial features */}
          <circle cx="80" cy="115" r="3" fill="#8b5a3c" />
          <circle cx="120" cy="115" r="3" fill="#8b5a3c" />
          <path d="M 88 160 Q 100 168 112 160" stroke="#d4a574" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Area Information */}
      {activeArea && (
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-rose-200 animate-fade-in">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            {areaInfo[activeArea].title}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Common Concerns:</h4>
              <div className="flex flex-wrap gap-1">
                {areaInfo[activeArea].concerns.map((concern, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Recommended Ingredients:</h4>
              <div className="flex flex-wrap gap-1">
                {areaInfo[activeArea].ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
