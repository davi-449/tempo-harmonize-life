
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: {
      container: 'h-6 w-6',
      icon: 'h-3 w-3',
      text: 'text-base'
    },
    md: {
      container: 'h-8 w-8',
      icon: 'h-4 w-4',
      text: 'text-xl'
    },
    lg: {
      container: 'h-12 w-12',
      icon: 'h-6 w-6',
      text: 'text-3xl'
    }
  };

  return (
    <Link to="/" className={cn("flex items-center space-x-2 group", className)}>
      <div className={cn("relative", sizeMap[size].container)}>
        <div className="absolute inset-0 rounded-full bg-kairos-blue-deep dark:bg-kairos-dark border-2 border-kairos-blue-deep dark:border-kairos-purple flex items-center justify-center">
          <Check className={cn("text-white kairos-check", sizeMap[size].icon)} />
        </div>
      </div>
      {showText && (
        <span className={cn("font-bold text-kairos-blue-deep dark:text-white", sizeMap[size].text)}>
          KAIROS
        </span>
      )}
    </Link>
  );
}
