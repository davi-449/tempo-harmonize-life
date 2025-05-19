
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-kairos-blue-light to-kairos-purple dark:from-kairos-purple dark:to-kairos-blue-light border border-kairos-blue-light/20 dark:border-kairos-purple/20 flex items-center justify-center shadow-md overflow-hidden">
          <Check className={cn("text-white", sizeMap[size].icon)} />
        </div>
      </div>
      {showText && (
        <span className={cn("font-bold bg-gradient-to-r from-kairos-blue-deep to-kairos-purple dark:from-kairos-blue-light dark:to-kairos-purple bg-clip-text text-transparent transition-colors", sizeMap[size].text)}>
          KAIROS
        </span>
      )}
    </Link>
  );
}
