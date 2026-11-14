import React, { useState } from 'react';

// Interests on the left, career areas on the right. Each interest opens routes
// to the areas it usually points toward. Illustrative only: the real platform
// weighs four full assessments, not one tap.
const INTERESTS = [
  'Building and fixing things',
  'Working things out',
  'Making something original',
  'Helping people',
  'Persuading and leading',
  'Keeping things in order',
];

const AREAS = [
  'Engineering',
  'Computing, Data and AI',
  'Life Sciences and Research',
  'Medicine and Health',
  'Design and Media',
  'Teaching and Psychology',
  'Business and Law',
  'Finance and Accounting',
];

// interest index -> area indices
const ROUTES: number[][] = [
  [0, 1],
  [1, 2, 3],
  [4, 1],
  [3, 5],
  [6, 5],
  [7, 1, 6],
];

const y = (i: number, n: number) => ((i + 0.5) / n) * 100;
const routePath = (from: number, to: number) => {
  const y1 = y(from, INTERESTS.length);
  const y2 = y(to, AREAS.length);
  return `M0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`;
};

const RouteFinder: React.FC = () => {
  const [picked, setPicked] = useState<number[]>([1, 2]);

  const toggle = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const score = AREAS.map((_, a) => picked.filter((i) => ROUTES[i].includes(a)).length);
  const best = Math.max(...score);
  const leaders = best > 0 ? AREAS.filter((_, a) => score[a] === best) : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-xs text-white/60">
        <span>What pulls you?</span>
        <span className="truncate text-right text-[#B19EEF]" aria-live="polite">
          {leaders.length ? `Strongest pull: ${leaders[0]}${leaders.length > 1 ? ` +${leaders.length - 1}` : ''}` : 'Pick one or more'}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-0 px-3 py-4 sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] sm:px-5 sm:py-6">
        <div className="flex flex-col" role="group" aria-label="Interests">
          {INTERESTS.map((label, i) => {
            const on = picked.includes(i);
            return (
              <div key={label} className="flex flex-1 items-center py-1">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(i)}
                  className={`w-full rounded-full border px-3 py-2 text-left text-xs leading-snug transition-colors duration-300 sm:text-sm ${
                    on
                      ? 'border-[#B19EEF] bg-[#B19EEF] text-black'
                      : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              </div>
            );
          })}
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
          {ROUTES.flatMap((areas, i) =>
            areas.map((a) => (
              <path
                key={`base-${i}-${a}`}
                d={routePath(i, a)}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            )),
          )}
          {ROUTES.flatMap((areas, i) =>
            areas.map((a) => (
              <path
                key={`lit-${i}-${a}`}
                d={routePath(i, a)}
                fill="none"
                stroke="#B19EEF"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1 1"
                className="route-line"
                style={{ strokeDashoffset: picked.includes(i) ? 0 : 1 }}
              />
            )),
          )}
        </svg>

        <ul className="flex flex-col" aria-label="Career areas">
          {AREAS.map((label, a) => (
            <li
              key={label}
              className={`flex flex-1 items-center gap-2 py-1 pl-1 text-xs leading-snug transition-colors duration-500 sm:text-sm ${
                score[a] === 0 ? 'text-white/35' : score[a] === best ? 'text-white' : 'text-white/75'
              }`}
            >
              <span
                className={`size-1.5 shrink-0 rounded-full transition-colors duration-500 ${
                  score[a] === 0 ? 'bg-white/15' : 'bg-[#B19EEF]'
                }`}
              />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <span>These are examples, not a result.</span>
        <button
          type="button"
          onClick={() => setPicked([])}
          disabled={!picked.length}
          className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white disabled:opacity-30"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default RouteFinder;
