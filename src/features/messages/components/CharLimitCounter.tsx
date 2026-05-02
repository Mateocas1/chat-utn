type CharLimitCounterProps = {
  value: string;
  limit: number;
};

const THRESHOLD_WARNING = 0.8;

export function CharLimitCounter({ value, limit }: CharLimitCounterProps) {
  const remaining = limit - value.length;
  const ratio = limit > 0 ? value.length / limit : 0;
  const shouldWarn = ratio >= THRESHOLD_WARNING && ratio < 1;
  const atLimit = ratio >= 1;

  return (
    <div className="flex items-center justify-between text-xs text-muted">
      <span>{remaining} characters remaining</span>
      {shouldWarn ? (
        <span role="status" aria-live="polite" className="sr-only">
          80% of character limit reached
        </span>
      ) : null}
      {atLimit ? (
        <span role="status" aria-live="polite" className="sr-only">
          Character limit reached
        </span>
      ) : null}
    </div>
  );
}
