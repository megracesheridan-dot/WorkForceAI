export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-40 top-[-10%] h-[560px] w-[560px] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--accent-glow), transparent 70%)",
          filter: "blur(120px)",
          opacity: 0.35,
          animation: "drift-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-10%] top-[35%] h-[480px] w-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--cyan-glow), transparent 70%)",
          filter: "blur(110px)",
          opacity: 0.28,
          animation: "drift-b 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[8%] bottom-[-15%] h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--gold-glow), transparent 70%)",
          filter: "blur(130px)",
          opacity: 0.22,
          animation: "drift-c 30s ease-in-out infinite",
        }}
      />
    </div>
  );
}
