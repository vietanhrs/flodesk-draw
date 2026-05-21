import { FlodeskLogo } from "./FlodeskLogo";

export const RouteFallback = () => (
  <main className="route-fallback" aria-busy="true" aria-label="Loading page">
    <FlodeskLogo className="route-fallback__logo" />
    <div className="route-fallback__panel">
      <div className="route-fallback__line route-fallback__line--wide" />
      <div className="route-fallback__line" />
      <div className="route-fallback__block" />
    </div>
  </main>
);
