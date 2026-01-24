"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme-aware colors
    const isDark = theme === "dark";
    const bgColor = isDark ? "rgba(10, 10, 15, 0.05)" : "rgba(248, 249, 250, 0.3)";
    const particleColor = isDark ? "rgba(96, 165, 250, 0.6)" : "rgba(59, 130, 246, 0.4)"; // blue-400/blue-500
    const lineColor = isDark ? "rgba(147, 51, 234, " : "rgba(124, 58, 237, "; // purple-600/purple-600
    const triangleColor = isDark ? "rgba(59, 130, 246, " : "rgba(37, 99, 235, "; // blue-500/blue-600

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }
    particlesRef.current = particles;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      // Use theme-aware background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.vx -= (dx / distance) * force * 0.1;
          particle.vy -= (dy / distance) * force * 0.1;
        }

        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Draw particle with theme-aware color
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 120;

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * (isDark ? 0.3 : 0.2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${lineColor}${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw triangles occasionally
            if (Math.random() > 0.99) {
              const p3 =
                particles[Math.floor(Math.random() * particles.length)];
              const dx2 = p1.x - p3.x;
              const dy2 = p1.y - p3.y;
              const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

              if (distance2 < maxDistance) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.closePath();
                ctx.fillStyle = `${triangleColor}${opacity * 0.1})`;
                ctx.fill();
              }
            }
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
