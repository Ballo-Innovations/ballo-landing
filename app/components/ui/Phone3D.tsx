interface Props {
  children: React.ReactNode;
  floating?: React.ReactNode;
}

/** The layered 3D phone, drawn statically (no pointer tracking). */
export function Phone3D({ children, floating }: Props) {
  return (
    <div className="phone3d-scene scale-110">
      <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
        <div className="phone3d">
          <div className="phone3d-back" />
          <div className="phone3d-edge phone3d-edge-r" />
          <div className="phone3d-edge phone3d-edge-l" />
          <div className="phone3d-edge phone3d-edge-t" />
          <div className="phone3d-edge phone3d-edge-b" />

          {(["tl", "tr", "bl", "br"] as const).map((pos) => (
            <div key={pos} className={`phone3d-corner phone3d-corner-${pos}`}>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="phone3d-clayer" style={{ transform: `translateZ(-${i + 1}px)` }} />
              ))}
            </div>
          ))}

          <div className="phone3d-bezel">
            <div className="phone3d-inner-shell">
              <div className="phone3d-screen">
                {children}
                <div className="phone3d-home-bar" />
              </div>
            </div>
          </div>
        </div>

        {floating}
      </div>
    </div>
  );
}
