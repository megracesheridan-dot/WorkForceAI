function Blob({
  className,
  gradientVar,
  blur,
  animation,
  opacity,
}: {
  className: string;
  gradientVar: string;
  blur: number;
  animation: string;
  opacity: number;
}) {
  return (
    <div className={className} style={{ animation }}>
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `radial-gradient(circle, var(${gradientVar}), transparent 70%)`,
          filter: `blur(${blur}px)`,
          opacity,
        }}
      />
    </div>
  );
}

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <Blob
        className="absolute -left-40 top-[-10%] h-[560px] w-[560px]"
        gradientVar="--accent-glow"
        blur={40}
        opacity={0.6}
        animation="drift-a 22s ease-in-out infinite"
      />
      <Blob
        className="absolute right-[-10%] top-[35%] h-[480px] w-[480px]"
        gradientVar="--cyan-glow"
        blur={35}
        opacity={0.5}
        animation="drift-b 26s ease-in-out infinite"
      />
      <Blob
        className="absolute left-[8%] bottom-[-15%] h-[520px] w-[520px]"
        gradientVar="--gold-glow"
        blur={45}
        opacity={0.45}
        animation="drift-c 30s ease-in-out infinite"
      />
    </div>
  );
}
