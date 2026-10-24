'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

const stages = [
  {
    label: 'Collateral',
    detail: 'Approved assets form the foundation of your position.',
    signal: 'COLLATERAL IN',
  },
  {
    label: 'Mint',
    detail: 'The engine checks position health before issuing DSC.',
    signal: 'LIQUIDITY OUT',
  },
  {
    label: 'Monitor',
    detail: 'Oracle valuation and outstanding debt determine your health factor.',
    signal: 'EQUILIBRIUM CHECK',
  },
  {
    label: 'Repay',
    detail: 'Burn DSC to reduce debt and make room to redeem collateral.',
    signal: 'CLOSE THE LOOP',
  },
];

export default function ProtocolFlow() {
  const frame = useRef<HTMLDivElement>(null);
  const animation = useRef<number | null>(null);
  const [active, setActive] = useState(0);

  useEffect(
    () => () => {
      if (animation.current !== null) cancelAnimationFrame(animation.current);
    },
    [],
  );

  function move(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== 'mouse' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    animation.current = requestAnimationFrame(() => {
      frame.current?.style.setProperty('--tilt-x', `${-y * 7}deg`);
      frame.current?.style.setProperty('--tilt-y', `${x * 7}deg`);
    });
  }

  function reset() {
    if (animation.current !== null) cancelAnimationFrame(animation.current);
    frame.current?.style.setProperty('--tilt-x', '0deg');
    frame.current?.style.setProperty('--tilt-y', '0deg');
  }

  return (
    <div
      className="equilibrium"
      data-stage={active}
      ref={frame}
      onPointerMove={move}
      onPointerLeave={reset}
    >
      <div className="visual-topline">
        <span>
          <span className="signal-square" /> DSC / EQUILIBRIUM ENGINE
        </span>
        <span>FIG. 001</span>
      </div>
      <div className="equilibrium-drawing">
        <svg
          viewBox="0 0 620 530"
          role="img"
          aria-label="An equilibrium structure linking collateral, the DSC Engine, and issued DSC. Select a step below to explore the mechanism."
        >
          <defs>
            <linearGradient
              id="equilibrium-face"
              x1="160"
              y1="130"
              x2="420"
              y2="360"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8F79FF" />
              <stop offset="1" stopColor="#34217A" />
            </linearGradient>
            <linearGradient
              id="equilibrium-side"
              x1="310"
              y1="190"
              x2="440"
              y2="340"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4C379C" />
              <stop offset="1" stopColor="#20183F" />
            </linearGradient>
            <linearGradient
              id="equilibrium-base"
              x1="140"
              y1="360"
              x2="470"
              y2="440"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1B3D51" />
              <stop offset=".5" stopColor="#172737" />
              <stop offset="1" stopColor="#111A2B" />
            </linearGradient>
          </defs>
          <g className="construction-lines" fill="none">
            <path d="M310 26v456M62 275h496M110 125l400 280M105 412l410-287" />
            <ellipse cx="310" cy="310" rx="238" ry="125" />
            <ellipse cx="310" cy="310" rx="207" ry="108" />
          </g>
          <g className="base-platform">
            <path d="m124 382 186-101 186 101-186 102-186-102Z" fill="url(#equilibrium-base)" />
            <path d="m124 382 186 102 186-102v14L310 500 124 396v-14Z" fill="#0F1E30" />
            <path d="m124 382 186-101 186 101-186 102-186-102Z" fill="none" stroke="#365365" />
            <path d="m169 382 141-77 141 77-141 78-141-78Z" fill="none" stroke="#304657" />
          </g>
          <g className="collateral-ring" fill="none">
            <ellipse cx="310" cy="174" rx="168" ry="81" transform="rotate(-14 310 174)" />
            <ellipse cx="310" cy="174" rx="180" ry="89" transform="rotate(-14 310 174)" />
          </g>
          <g className="suspension-lines" fill="none">
            <path d="m183 134 61 89m206-74-70 95M310 94v112" />
            <path d="M310 329v71m-87-121-45 82m219-69 50 70" />
          </g>
          <g className="engine-crystal">
            <path
              d="m310 142 126 71-126 73-126-73 126-71Z"
              fill="url(#equilibrium-face)"
              stroke="#AC9BFF"
            />
            <path d="m184 213 126 73v97l-126-73v-97Z" fill="#312361" stroke="#7459B7" />
            <path
              d="m310 286 126-73v97l-126 73v-97Z"
              fill="url(#equilibrium-side)"
              stroke="#6E50AF"
            />
            <path
              d="m310 168 79 45-79 46-79-46 79-45Z"
              fill="#A48CFF"
              fillOpacity=".12"
              stroke="#C5B7FF"
              strokeOpacity=".45"
            />
            <path
              d="m309 186 28 16-28 16-13-7 16-9-16-9 13-7Zm-17 10 11 6-16 9 16 9-11 6-27-15 27-15Z"
              fill="#F2F5FC"
            />
            <path d="m214 246 68 39v40l-68-39v-40Z" fill="#765BFA" fillOpacity=".14" />
            <path d="m338 302 70-40v21l-70 41v-22Z" fill="#9E84FF" fillOpacity=".3" />
          </g>
          <g className="output-ring" fill="none">
            <ellipse cx="310" cy="351" rx="193" ry="85" transform="rotate(13 310 351)" />
            <path d="M133 330c-6 39 78 87 180 107" />
          </g>
          <g className="diagram-nodes">
            <circle cx="153" cy="157" r="6" />
            <circle cx="470" cy="365" r="6" />
            <circle cx="310" cy="94" r="4" />
            <circle cx="310" cy="400" r="4" />
          </g>
          <g className="diagram-callouts" fill="none">
            <path d="m153 157-53-31H42m428 239 55 33h55M310 94l66-39h97" />
            <path d="m310 400-75 48h-76" />
          </g>
          <g className="diagram-labels">
            <text x="43" y="112">
              COLLATERAL
            </text>
            <text x="43" y="141" className="diagram-label-sub">
              THE FOUNDATION
            </text>
            <text x="473" y="42" textAnchor="end">
              HEALTH FACTOR
            </text>
            <text x="473" y="68" textAnchor="end" className="diagram-label-sub">
              THE BALANCE
            </text>
            <text x="578" y="387" textAnchor="end">
              DSC
            </text>
            <text x="578" y="413" textAnchor="end" className="diagram-label-sub">
              THE LIQUIDITY
            </text>
            <text x="158" y="470">
              REPAY / REDEEM
            </text>
          </g>
        </svg>
      </div>
      <div className="visual-readout">
        <span className="signal-square" />
        <span>{stages[active].signal}</span>
        <span>0{active + 1} / 04</span>
      </div>
      <div className="visual-controls" role="group" aria-label="Explore the protocol mechanism">
        {stages.map((stage, index) => (
          <button
            key={stage.label}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span>0{index + 1}</span>
            {stage.label}
          </button>
        ))}
      </div>
      <p className="visual-caption" aria-live="polite">
        {stages[active].detail}
      </p>
    </div>
  );
}
