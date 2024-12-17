import Image from 'next/image';
import SnakeDetector from '@/components/snake-detector';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background images with dark overlay */}
      <div className="fixed inset-0">
        {/* Desktop background */}
        <div className="hidden sm:block absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/desktop-bg.png"
              alt="background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/75" /> {/* Dark overlay */}
          </div>
        </div>
        
        {/* Mobile background */}
        <div className="sm:hidden absolute inset-0">
          <div className="relative w-full h-full">
            <Image
              src="/images/mobile-bg.png"
              alt="background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/75" /> {/* Dark overlay */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <SnakeDetector />
      </div>
    </div>
  );
}