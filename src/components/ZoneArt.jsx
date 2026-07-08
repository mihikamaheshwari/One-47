/* Custom neon zone illustrations — drawn in the site palette so the activity
   cards always match their names and the black/electric-blue aesthetic. */

const INK = '#05060f';
const PANEL = '#0b0e20';
const BLUE = '#2f7dff';
const SOFT = '#4da3ff';
const CYAN = '#00e5ff';
const VIOLET = '#7c5cff';

function Frame({ id, children }) {
  return (
    <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0d22" />
          <stop offset="1" stopColor={INK} />
        </linearGradient>
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" /><feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-bg)`} />
      {/* faint perspective grid */}
      {[0, 1, 2, 3].map((i) => (
        <line key={'h' + i} x1="0" y1={185 + i * 16} x2="400" y2={182 + i * 20} stroke={BLUE} strokeOpacity="0.08" />
      ))}
      {children}
    </svg>
  );
}

function Snooker() {
  const g = 'url(#zsn-glow)';
  return (
    <Frame id="zsn">
      <g transform="rotate(-6 200 120)">
        {/* rails + felt */}
        <rect x="52" y="40" width="296" height="160" rx="12" fill="#070a1c" stroke={VIOLET} strokeOpacity=".55" strokeWidth="2" />
        <rect x="66" y="54" width="268" height="132" rx="7" fill="#10339b" />
        <rect x="66" y="54" width="268" height="132" rx="7" fill="none" stroke={CYAN} strokeOpacity=".25" />
        {/* pockets */}
        {[[70, 58], [70, 182], [330, 58], [330, 182], [200, 55], [200, 185]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" fill="#020208" stroke={SOFT} strokeOpacity=".4" />
        ))}
        {/* baulk line + D */}
        <line x1="288" y1="56" x2="288" y2="184" stroke="#bcd6ff" strokeOpacity=".4" />
        <path d="M 288 96 A 24 24 0 0 0 288 144" fill="none" stroke="#bcd6ff" strokeOpacity=".4" />
        {/* red pack */}
        {[[128, 120], [118, 114], [118, 126], [108, 108], [108, 120], [108, 132]].map(([x, y], i) => (
          <circle key={'r' + i} cx={x} cy={y} r="5.2" fill="#e02330" />
        ))}
        {/* colours */}
        <circle cx="140" cy="120" r="5.2" fill="#ff9ec4" />
        <circle cx="200" cy="120" r="5.2" fill="#1e4fd6" stroke="#9fc6ff" strokeOpacity=".6" />
        <circle cx="96" cy="120" r="5.2" fill="#0a0a0c" stroke="#3a3a4a" />
        {/* cue ball + cue */}
        <circle cx="262" cy="126" r="5.6" fill="#f5f2e8" filter={g} />
        <line x1="270" y1="122" x2="382" y2="70" stroke="#c9954f" strokeWidth="5" strokeLinecap="round" />
        <line x1="270" y1="122" x2="286" y2="114" stroke={SOFT} strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* under-glow */}
      <ellipse cx="200" cy="212" rx="150" ry="10" fill={BLUE} opacity=".14" />
    </Frame>
  );
}

function Ps5() {
  const g = 'url(#zps-glow)';
  return (
    <Frame id="zps">
      {/* screen glow */}
      <rect x="120" y="18" width="160" height="66" rx="6" fill="#070a1c" stroke={VIOLET} strokeOpacity=".5" />
      <rect x="128" y="26" width="144" height="50" rx="3" fill="#0b1330" />
      <path d="M136 66 L176 34 L204 56 L232 30 L264 62" fill="none" stroke={CYAN} strokeWidth="2" filter={g} />
      {/* controller body */}
      <path
        d="M120 132 q-6 -22 18 -26 l22 -3 q10 -8 40 -8 t40 8 l22 3 q24 4 18 26 l-8 44 q-4 22 -24 20 q-14 -2 -22 -22 l-4 -10 h-44 l-4 10 q-8 20 -22 22 q-20 2 -24 -20 z"
        fill={PANEL} stroke={SOFT} strokeWidth="2.2" filter={g}
      />
      {/* light bar */}
      <path d="M182 100 h36 v6 q-18 6 -36 0 z" fill={BLUE} opacity=".9" filter={g} />
      {/* sticks */}
      <circle cx="172" cy="150" r="13" fill="#070a1c" stroke={CYAN} strokeWidth="2" />
      <circle cx="228" cy="150" r="13" fill="#070a1c" stroke={CYAN} strokeWidth="2" />
      {/* d-pad */}
      <g fill={VIOLET} opacity=".95">
        <rect x="138" y="122" width="8" height="22" rx="2" />
        <rect x="131" y="129" width="22" height="8" rx="2" />
      </g>
      {/* face symbols: triangle / circle / cross / square */}
      <path d="M258 116 l5 8 h-10 z" fill="none" stroke={CYAN} strokeWidth="1.8" />
      <circle cx="272" cy="132" r="4.6" fill="none" stroke={SOFT} strokeWidth="1.8" />
      <path d="M254 128 l8 8 M262 128 l-8 8" stroke={VIOLET} strokeWidth="1.8" />
      <rect x="258" y="141" width="8.5" height="8.5" fill="none" stroke={BLUE} strokeWidth="1.8" />
      <ellipse cx="200" cy="214" rx="130" ry="9" fill={VIOLET} opacity=".13" />
    </Frame>
  );
}

function Cafe() {
  const g = 'url(#zcf-glow)';
  return (
    <Frame id="zcf">
      {/* steam */}
      <path d="M186 62 q-8 14 2 24 q8 10 0 22" fill="none" stroke={CYAN} strokeWidth="2.4" strokeLinecap="round" opacity=".8" filter={g} />
      <path d="M214 56 q-8 14 2 24 q8 10 0 22" fill="none" stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" opacity=".65" filter={g} />
      {/* cup */}
      <path d="M156 116 h88 v40 q0 26 -44 26 t-44 -26 z" fill={PANEL} stroke={SOFT} strokeWidth="2.4" filter={g} />
      <ellipse cx="200" cy="116" rx="44" ry="9" fill="#0b1330" stroke={SOFT} strokeWidth="2" />
      <ellipse cx="200" cy="116" rx="33" ry="6" fill="#3d2a12" stroke="#d8a35c" strokeOpacity=".8" />
      {/* 47 latte art */}
      <text x="200" y="121" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#ffd9a0" opacity=".9">47</text>
      {/* handle */}
      <path d="M244 126 q22 2 20 18 q-2 16 -22 14" fill="none" stroke={SOFT} strokeWidth="2.4" />
      {/* saucer */}
      <ellipse cx="200" cy="188" rx="66" ry="10" fill="#070a1c" stroke={VIOLET} strokeOpacity=".6" strokeWidth="2" />
      {/* pizza slice */}
      <g transform="rotate(-14 116 168)">
        <path d="M86 150 l60 12 -50 28 z" fill="#1a1230" stroke={VIOLET} strokeWidth="2" />
        <circle cx="104" cy="164" r="3.4" fill={BLUE} />
        <circle cx="116" cy="172" r="3.4" fill={CYAN} />
      </g>
      {/* sparkles */}
      <path d="M296 84 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill={CYAN} opacity=".8" filter={g} />
      <ellipse cx="200" cy="214" rx="120" ry="9" fill={BLUE} opacity=".12" />
    </Frame>
  );
}

function Indoor() {
  const g = 'url(#zin-glow)';
  return (
    <Frame id="zin">
      {/* dartboard */}
      <g transform="translate(160 118)">
        <circle r="62" fill="#070a1c" stroke={VIOLET} strokeWidth="2.4" filter={g} />
        <circle r="48" fill="none" stroke={SOFT} strokeOpacity=".7" strokeWidth="1.6" />
        <circle r="34" fill="#0b1330" stroke={SOFT} strokeOpacity=".5" />
        <circle r="20" fill="none" stroke={CYAN} strokeOpacity=".7" strokeWidth="1.6" />
        <circle r="6.5" fill={CYAN} filter={g} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <line key={a} x1={-60 * Math.cos((a * Math.PI) / 180)} y1={-60 * Math.sin((a * Math.PI) / 180)}
            x2={60 * Math.cos((a * Math.PI) / 180)} y2={60 * Math.sin((a * Math.PI) / 180)}
            stroke={BLUE} strokeOpacity=".3" />
        ))}
      </g>
      {/* dart */}
      <g transform="rotate(38 232 66)">
        <line x1="196" y1="86" x2="252" y2="86" stroke="#c9954f" strokeWidth="4" strokeLinecap="round" />
        <path d="M252 86 l14 -4 v8 z" fill={CYAN} filter={g} />
        <path d="M196 80 l-12 6 12 6 z" fill={VIOLET} />
      </g>
      {/* dice */}
      <g transform="rotate(-12 300 168)">
        <rect x="272" y="140" width="52" height="52" rx="10" fill={PANEL} stroke={SOFT} strokeWidth="2.2" filter={g} />
        {[[286, 154], [312, 154], [299, 166], [286, 178], [312, 178]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={CYAN} />
        ))}
      </g>
      {/* chess pawn */}
      <path d="M76 190 h44 l-8 -12 h-6 q10 -12 2 -26 q12 -4 8 -16 q-4 -12 -18 -12 t-18 12 q-4 12 8 16 q-8 14 2 26 h-6 z"
        fill="#0e1230" stroke={VIOLET} strokeWidth="2" filter={g} transform="scale(.9) translate(8 18)" />
      <ellipse cx="200" cy="216" rx="140" ry="9" fill={VIOLET} opacity=".12" />
    </Frame>
  );
}

const ART = { snooker: Snooker, ps5: Ps5, cafe: Cafe, indoor: Indoor };

export default function ZoneArt({ kind }) {
  const Art = ART[kind] || Snooker;
  return <Art />;
}
