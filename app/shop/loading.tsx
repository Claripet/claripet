export default function ShopLoading() {
  return (
    <main>
      <div className="page-head wrap">
        <div className="skel" style={{ height: 46, width: 320, maxWidth: "80%" }} />
        <div className="skel" style={{ height: 20, width: 420, maxWidth: "60%", marginTop: 14 }} />
      </div>
      <div className="wrap section-sm" style={{ paddingTop: 0 }}>
        <div className="shop-toolbar">
          <div className="filter-pills">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skel" style={{ height: 38, width: 96, borderRadius: 999 }} />
            ))}
          </div>
          <div className="skel" style={{ height: 42, width: 180 }} />
        </div>
        <div className="prod-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skel skel-card" />
          ))}
        </div>
      </div>
    </main>
  );
}
