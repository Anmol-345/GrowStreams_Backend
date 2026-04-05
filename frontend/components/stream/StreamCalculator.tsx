import React, { useState } from "react";

const SECONDS_IN_DAY = 86400;
const SECONDS_IN_MONTH = 2592000; // 30 days
const GROW_DECIMALS = 9; // 1 GROW = 1_000_000_000 units

function toRawFlowRate(grow: number, per: "second" | "day" | "month") {
  let perSecond = 0;
  if (per === "second") perSecond = grow;
  if (per === "day") perSecond = grow / SECONDS_IN_DAY;
  if (per === "month") perSecond = grow / SECONDS_IN_MONTH;
  return Math.floor(perSecond * Math.pow(10, GROW_DECIMALS));
}

function fromRawFlowRate(raw: number) {
  return raw / Math.pow(10, GROW_DECIMALS);
}

export type StreamCalculatorProps = {
  onChange?: (rawFlowRate: number) => void;
  initialAmount?: number;
  initialMode?: "second" | "day" | "month";
  depositAmount?: number; // GROW
};

export const StreamCalculator: React.FC<StreamCalculatorProps> = ({
  onChange,
  initialAmount = 0,
  initialMode = "day",
  depositAmount = 0,
}) => {
  const [mode, setMode] = useState<"second" | "day" | "month">(
    initialMode
  );
  const [amount, setAmount] = useState<number>(initialAmount);

  // Calculate raw flow rate
  const rawFlowRate = toRawFlowRate(amount, mode);
  const growPerSecond = fromRawFlowRate(rawFlowRate);
  const growPerDay = growPerSecond * SECONDS_IN_DAY;
  const growPerMonth = growPerSecond * SECONDS_IN_MONTH;
  const minBuffer = growPerSecond * 3600; // 1 hour buffer
  const durationSeconds = depositAmount > 0 && growPerSecond > 0 ? (depositAmount / growPerSecond) : 0;
  const durationDays = durationSeconds / 86400;

  React.useEffect(() => {
    onChange?.(rawFlowRate);
  }, [rawFlowRate, onChange]);

  return (
    <div className="stream-calc border rounded p-4 space-y-4 bg-white">
      <div className="flex space-x-2 mb-2">
        {["second", "day", "month"].map((m) => (
          <button
            key={m}
            className={`px-3 py-1 rounded ${mode === m ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setMode(m as any)}
          >
            {m === "second" && "Per Second"}
            {m === "day" && "Per Day"}
            {m === "month" && "Per Month"}
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={0}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="border px-2 py-1 rounded w-32"
        />
        <span>GROW / {mode}</span>
      </div>
      <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
        <div>
          <strong>Flow Rate:</strong> {growPerSecond.toFixed(9)} GROW/sec
        </div>
        <div>
          <strong>Raw flowRate:</strong> {rawFlowRate} (internal units)
        </div>
        <div>
          <strong>Est. Outflow:</strong> {growPerDay.toFixed(4)} GROW/day, {growPerMonth.toFixed(4)} GROW/month
        </div>
        <div>
          <strong>Min. Buffer (1h):</strong> {minBuffer.toFixed(4)} GROW
          <span className="ml-2 text-gray-500">(Top up to 1h, 6h, 24h: {[
            1, 6, 24
          ].map(h => (growPerSecond * 3600 * h).toFixed(4)).join(", ")})</span>
        </div>
        {depositAmount > 0 && growPerSecond > 0 && (
          <div>
            <strong>Stream duration for {depositAmount} GROW:</strong> ~{durationDays.toFixed(2)} days
          </div>
        )}
      </div>
    </div>
  );
};
