import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import "./StatCard.css";

export default function StatCard({ icon: Icon, label, value, trend, trendNote }) {
  const isUp = typeof trend === "number" && trend >= 0;
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {Icon && (
          <span className="stat-card-icon">
            <Icon size={17} />
          </span>
        )}
      </div>
      <span className="stat-card-value">{value}</span>
      {typeof trend === "number" && (
        <span className={`stat-card-trend ${isUp ? "is-up" : "is-down"}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
          {trendNote && <span className="stat-card-trend-note">· {trendNote}</span>}
        </span>
      )}
    </div>
  );
}
