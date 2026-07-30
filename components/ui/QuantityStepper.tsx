import { Icon } from "@/components/icons";

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="qstep">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(1, value - 1))} style={{ minWidth: "44px", minHeight: "44px" }}>
        <Icon name="minus" size={19} />
      </button>
      <span className="qval">{value}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)} style={{ minWidth: "44px", minHeight: "44px" }}>
        <Icon name="plus" size={19} />
      </button>
    </div>
  );
}
