import { ImageResponse } from "next/og";

export const alt = "Sinapse — suas anotações, conectadas como o seu cérebro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 50% -20%, #ede9fe 0%, #ffffff 60%)",
          color: "#0a0a0a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#7C3AED",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Sinapse</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2, maxWidth: 960 }}>
            Suas anotações, conectadas como o seu cérebro.
          </div>
          <div style={{ fontSize: 30, color: "#525252", maxWidth: 900 }}>
            Editor em blocos, matérias e [[links]] entre notas. Grátis e direto no navegador.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
