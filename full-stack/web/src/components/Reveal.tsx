import { useEffect, useRef, useState, ReactNode } from 'react';
import { cls } from '../lib/format';

export function Reveal({
  children, delay = 0, className = '', direction = 'up',
}: { children: ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' | 'none' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const hidden = {
    up: 'translate-y-8 opacity-0',
    left: '-translate-x-8 opacity-0',
    right: 'translate-x-8 opacity-0',
    none: 'opacity-0',
  };
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cls(className, 'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]', visible ? 'translate-x-0 translate-y-0 opacity-100' : hidden[direction])}
    >
      {children}
    </div>
  );
}
