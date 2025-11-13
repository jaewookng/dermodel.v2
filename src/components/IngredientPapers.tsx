import { useIngredientPapers } from '@/hooks/useIngredientPapers';

interface IngredientPapersProps {
  ingredientName: string;
}

export const IngredientPapers = ({ ingredientName }: IngredientPapersProps) => {
  const { data: papers, isLoading } = useIngredientPapers(ingredientName);

  if (isLoading) {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-400 italic">Loading research papers...</p>
      </div>
    );
  }

  if (!papers || papers.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-0.5 pointer-events-auto">
      {papers.map((paper) => (
        <div key={paper.id} className="flex items-start gap-1.5 pointer-events-auto">
          <span className="text-blue-400 text-[8px] mt-0.5 pointer-events-none">●</span>
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-1.5 py-0.5 rounded inline-block max-w-full truncate pointer-events-auto"
            title={`${paper.title} - ${paper.authors} (${paper.year})`}
          >
            {paper.title}
          </a>
        </div>
      ))}
    </div>
  );
};
