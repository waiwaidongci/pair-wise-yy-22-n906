import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { StatusBadge } from "./components/common/StatusBadge";
import { PlansPage } from "./pages/PlansPage";
import { ImagesPage } from "./pages/ImagesPage";
import "./styles.css";

function PageStub({ name }: { name: string }) {
  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>{name}</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <section className="panel">
        <p>「{name}」页面建设中，修复方案审批台已上线。</p>
      </section>
    </main>
  );
}

function renderPage(route: string, name: string) {
  if (route === "/plans") return <PlansPage />;
  return <PageStub name={name} />;
}

function App() {
  const [active, setActive] = useState<string>(routes.find((route) => route.route === "/plans")?.route ?? routes[0].route);
  const current = routes.find((route) => route.route === active) ?? routes[0];
  return (
    <div className="shell">
      <aside>
        <div className="brand">文物修复档案协作平台</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
              {route.route === "/plans" && <em className="nav-tag">审批台</em>}
            </button>
          ))}
        </nav>
      </aside>
      {renderPage(current.route, current.name)}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
