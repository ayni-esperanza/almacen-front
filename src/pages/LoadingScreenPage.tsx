import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadingLogo } from "../shared";

const sanitizeNextUrl = (url: string) => {
  const value = (url || "").trim();
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/login";
  }

  if (value.startsWith("/loading")) {
    return "/login";
  }

  return value;
};

interface LoadingScreenPageProps {
  autoNavigate?: boolean;
  textOverride?: string;
}

export const LoadingScreenPage = ({
  autoNavigate = true,
  textOverride,
}: LoadingScreenPageProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "generic";
  const nextRaw = searchParams.get("next") || "/login";

  const nextUrl = useMemo(() => sanitizeNextUrl(nextRaw), [nextRaw]);
  const loadingText =
    textOverride ?? (source === "logout" ? "Cerrando sesion" : "Cargando");
  const durationMs = source === "logout" ? 300 : 850;

  useEffect(() => {
    if (!autoNavigate) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      navigate(nextUrl, { replace: true });
    }, durationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoNavigate, navigate, nextUrl, durationMs]);

  return (
    <section
      className="loading-screen-page"
      aria-live="polite"
      aria-label="Pantalla de carga AYNI"
    >
      <div className="loading-screen-card">
        <LoadingLogo
          fullscreen={false}
          size="lg"
          mode="stroke"
          text={loadingText}
          showText
          className="loading-screen-logo"
        />
      </div>
    </section>
  );
};
