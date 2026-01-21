"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  animation?:
    | "fade-in"
    | "slide-in-from-bottom"
    | "slide-in-from-left"
    | "slide-in-from-right"
    | "slide-up";
  delay?: number;
}

export default function ScrollAnimation({
  children,
  className = "",
  animation = "fade-in",
  delay = 0,
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // Element is in view - add animate class to play animation
            const delayMs = typeof delay === 'number' ? delay * 1000 : delay;
            setTimeout(() => {
              element.classList.add("animate");
            }, delayMs);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  return (
    <div ref={elementRef} className={`${animation} ${className}`}>
      {children}
    </div>
  );
}
