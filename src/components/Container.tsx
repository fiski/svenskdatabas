import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className="w-full flex justify-center">
      <div
        className={`
          w-full
          max-w-[calc(100vw-48px)]
          md-m3:max-w-[calc(100vw-48px)]
          lg-m3:max-w-[calc(100vw-400px)]
          xl-m3:max-w-[1199px]
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  );
}
