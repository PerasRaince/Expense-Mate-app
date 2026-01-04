export default function SpiralMenu({ open, totals }) {
  if (!open) return null;

  return (
    <div className="spiral">
      <div className="spiral-item week">
        Week
        <small>₹ {totals.week}</small>
      </div>

      <div className="spiral-item month">
        Month
        <small>₹ {totals.month}</small>
      </div>

      <div className="spiral-item year">
        Year
        <small>₹ {totals.year}</small>
      </div>
    </div>
  );
}
