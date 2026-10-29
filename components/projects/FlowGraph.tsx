import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { prefersReducedMotion } from './useCanvasLoop';

interface Agent {
  name: string;
  role: string;
  output: string;
}

interface Workflow {
  id: string;
  label: string;
  input: string;
  agents: Agent[];
}

// Illustrative outputs, replayed in the browser. No model is called here.
const WORKFLOWS: Workflow[] = [
  {
    id: 'research',
    label: 'Research',
    input: 'How well do heat pumps work in cold climates?',
    agents: [
      {
        name: 'Researcher',
        role: 'Gathers points',
        output: 'Found 6 points: refrigerant cycle, efficiency below −15 °C, inverter compressors, backup heat, cost, field studies.',
      },
      {
        name: 'Analyzer',
        role: 'Weighs them',
        output: 'Main tradeoff: efficiency falls as it gets colder, but cold-climate units still deliver about twice the energy they use at −15 °C.',
      },
      {
        name: 'Summarizer',
        role: 'Writes the summary',
        output: 'Heat pumps move heat instead of making it. Modern cold-climate models keep working well below freezing, just less efficiently.',
      },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    input: 'A launch post for a weekend hackathon',
    agents: [
      {
        name: 'Ideation',
        role: 'Finds angles',
        output: 'Three angles: the 48-hour clock, the people in the room, and what actually got shipped.',
      },
      {
        name: 'Writer',
        role: 'Drafts it',
        output: 'Draft ready, 420 words. Opens on the final hour, then rewinds to Friday night.',
      },
      {
        name: 'Editor',
        role: 'Tightens it',
        output: 'Cut 90 words, sharpened the opening line, evened out the tone in paragraph three.',
      },
    ],
  },
  {
    id: 'code',
    label: 'Code review',
    input: 'for (const id of ids) { users.push(await db.user(id)); }',
    agents: [
      {
        name: 'Analyzer',
        role: 'Reads the code',
        output: 'Each loop step waits on its own database query, so 200 ids means 200 round trips.',
      },
      {
        name: 'Suggester',
        role: 'Proposes a fix',
        output: 'Fetch them in one query with db.users(ids), then map the results by id.',
      },
    ],
  },
];

const FlowGraph: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const edgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [wfIndex, setWfIndex] = useState(0);
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(0);
  const [typed, setTyped] = useState('');
  const [inView, setInView] = useState(false);
  const wf = WORKFLOWS[wfIndex];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    tlRef.current?.kill();
    const edges = edgeRefs.current.slice(0, wf.agents.length);
    edges.forEach((e) => e && gsap.set(e, { '--fill': 0 }));

    if (prefersReducedMotion()) {
      edges.forEach((e) => e && gsap.set(e, { '--fill': 1 }));
      setActive(-1);
      setDone(wf.agents.length);
      setTyped('');
      return;
    }

    setActive(-1);
    setDone(0);
    setTyped('');

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, paused: !inView });
    tl.call(() => {
      setActive(-1);
      setDone(0);
      setTyped('');
    });
    tl.set(edges, { '--fill': 0 });
    wf.agents.forEach((agent, i) => {
      tl.to(edges[i], { '--fill': 1, duration: 0.55, ease: 'power2.inOut' });
      tl.call(() => {
        setActive(i);
        setTyped('');
      });
      const chars = { n: 0 };
      tl.to(
        chars,
        {
          n: agent.output.length,
          duration: Math.min(1.8, agent.output.length * 0.018),
          ease: 'none',
          onUpdate: () => setTyped(agent.output.slice(0, Math.round(chars.n))),
        },
        '+=0.45',
      );
      tl.call(() => {
        setDone(i + 1);
        setActive(-1);
      }, undefined, '+=0.35');
    });
    tlRef.current = tl;
    return () => {
      tl.kill();
    };
  }, [wfIndex]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    inView ? tl.play() : tl.pause();
  }, [inView, wfIndex]);

  const log = wf.agents.slice(0, done).map((a) => ({ name: a.name, text: a.output }));
  if (active >= 0) log.push({ name: wf.agents[active].name, text: typed });

  return (
    <div ref={rootRef} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-xs text-white/60">
        <div role="tablist" aria-label="Workflow" className="flex gap-1">
          {WORKFLOWS.map((w, i) => (
            <button
              key={w.id}
              role="tab"
              type="button"
              aria-selected={i === wfIndex}
              onClick={() => setWfIndex(i)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                i === wfIndex ? 'bg-[#B19EEF] text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        <span className="text-white/45">Sample run, replayed</span>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-5 rounded-xl border border-dashed border-white/15 px-4 py-3">
          <p className="text-xs text-white/45">Input</p>
          <p className={`mt-1 text-sm text-white/85 ${wf.id === 'code' ? 'font-mono text-[13px]' : ''}`}>{wf.input}</p>
        </div>

        <ol className="flow-graph flex flex-col items-stretch md:flex-row md:items-center">
          {wf.agents.map((agent, i) => {
            const state = i < done ? 'done' : i === active ? 'active' : 'idle';
            return (
              <li key={`${wf.id}-${agent.name}`} className="flex flex-col items-stretch md:flex-1 md:flex-row md:items-center">
                <div
                  ref={(el) => {
                    edgeRefs.current[i] = el;
                  }}
                  className="flow-edge"
                  aria-hidden
                />
                <div
                  className={`relative min-w-0 rounded-xl border px-3 py-3 transition-[border-color,box-shadow,background-color] duration-300 md:flex-1 ${
                    state === 'active'
                      ? 'border-[#B19EEF] bg-[#2D1B4E]/50 shadow-[0_0_28px_rgba(177,158,239,0.35)]'
                      : state === 'done'
                        ? 'border-[#B19EEF]/40 bg-[#2D1B4E]/20'
                        : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {state === 'active' ? (
                      <span className="flow-thinking text-[#B19EEF]">Working</span>
                    ) : state === 'done' ? (
                      <span className="text-[#B19EEF]">Done</span>
                    ) : (
                      agent.role
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 min-h-[9.5rem] space-y-2.5 rounded-xl bg-white/[0.03] px-4 py-3">
          {log.length === 0 ? (
            <p className="text-sm text-white/35">Waiting for the first agent…</p>
          ) : (
            log.map((entry, i) => (
              <p key={`${entry.name}-${i}`} className={`text-sm leading-relaxed ${i === log.length - 1 ? 'text-white/90' : 'text-white/45'}`}>
                <span className="mr-2 text-[#B19EEF]">{entry.name}</span>
                {entry.text}
                {i === log.length - 1 && active >= 0 && <span className="flow-caret" aria-hidden />}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowGraph;
