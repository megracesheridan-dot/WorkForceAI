export function HeroMesh() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-10%] h-[1000px] w-[1500px] -translate-x-1/2 [animation:mesh-shift_16s_ease-in-out_infinite]">
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(45% 55% at 22% 30%, rgba(247,166,0,0.55), transparent 68%)," +
              "radial-gradient(40% 50% at 78% 20%, rgba(59,130,246,0.5), transparent 68%)," +
              "radial-gradient(50% 55% at 50% 75%, rgba(255,187,51,0.3), transparent 70%)",
            filter: "blur(25px)",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
    </div>
  );
}
