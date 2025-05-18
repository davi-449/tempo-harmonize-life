
import { TaskCategory } from '@/context/TaskContext';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: TaskCategory;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const getCategoryColor = (category: TaskCategory) => {
    const colors: Record<TaskCategory, { bg: string, text: string }> = {
      personal: { 
        bg: 'bg-[#E5DEFF] dark:bg-[#5D4A9C]', 
        text: 'text-[#5D4A9C] dark:text-[#E5DEFF]'
      },
      work: {
        bg: 'bg-[#D3E4FD] dark:bg-[#3A5F8A]',
        text: 'text-[#3A5F8A] dark:text-[#D3E4FD]'
      },
      fitness: {
        bg: 'bg-[#F2FCE2] dark:bg-[#55803E]',
        text: 'text-[#55803E] dark:text-[#F2FCE2]'
      },
      academic: {
        bg: 'bg-[#FEF7CD] dark:bg-[#9C7E23]',
        text: 'text-[#9C7E23] dark:text-[#FEF7CD]'
      },
    };

    return colors[category];
  };

  const { bg, text } = getCategoryColor(category);

  return (
    <span className={cn(
      'category-badge',
      bg,
      text,
      className
    )}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
