import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Calm color palette (HSL values)
    const colors = [
      { h: 132, s: 20, l: 85 }, // Sage light
      { h: 200, s: 40, l: 80 }, // Soft blue
      { h: 280, s: 30, l: 85 }, // Lavender
      { h: 16, s: 60, l: 88 },  // Soft coral
      { h: 45, s: 40, l: 90 },  // Warm cream
    ];

    // Floating orbs
    const orbs = colors.map((color, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 150 + Math.random() * 200,
      color,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      phase: i * (Math.PI / 2.5),
    }));

    const animate = () => {
      time += 0.005;
      
      // Clear with slight fade for trail effect
      ctx.fillStyle = "hsla(40, 20%, 98%, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        // Gentle floating movement
        orb.x += orb.speedX + Math.sin(time + orb.phase) * 0.5;
        orb.y += orb.speedY + Math.cos(time + orb.phase) * 0.5;

        // Wrap around edges smoothly
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        // Pulsing radius
        const pulsingRadius = orb.radius + Math.sin(time * 2 + orb.phase) * 20;

        // Draw gradient orb
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          pulsingRadius
        );

        gradient.addColorStop(0, `hsla(${orb.color.h}, ${orb.color.s}%, ${orb.color.l}%, 0.4)`);
        gradient.addColorStop(0.5, `hsla(${orb.color.h}, ${orb.color.s}%, ${orb.color.l}%, 0.2)`);
        gradient.addColorStop(1, `hsla(${orb.color.h}, ${orb.color.s}%, ${orb.color.l}%, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulsingRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;
