import React, { useEffect, useState } from 'react';
import htm from 'htm';
import { LEVELS } from './curriculum.js';
import { getPyodide, runPython } from './python.js';
import Scene3D from './Scene3D.js';

// htm = JSX-like templates that run directly in the browser (no build step needed)
const html = htm.bind(React.createElement);

const ALL = LEVELS.flatMap((l) => l.lessons.map((x) => ({ ...x, level: l.name })));

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

const MESSAGES = {
  ok: 'Correct! Your output matches.',
  wrong: 'Not quite. Compare your output with the expected output.',
  error: 'Your code has an error. Read the output and fix it.',
};

export default function App() {
  const start = Math.min(Math.max(Number(read('pystep-cur', 0)) || 0, 0), ALL.length - 1);
  const [i, setI] = useState(start);
  const [done, setDone] = useState(() => read('pystep-done', []));
  const [code, setCode] = useState(ALL[start].c);
  const [out, setOut] = useState('');
  const [state, setState] = useState('idle');
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(true);
  const lesson = ALL[i];

  useEffect(() => {
    getPyodide()
      .then(() => setReady(true))
      .catch((e) => {
        setOut(e.message);
        setState('error');
      });
  }, []);

  const go = (n) => {
    setI(n);
    setCode(ALL[n].c);
    setOut('');
    setState('idle');
    setMenu(false);
    setOpen(true);
    write('pystep-cur', n);
  };

  const run = async () => {
    setState('running');
    const { text, error } = await runPython(code);
    setOut(error ? (text ? text + '\n' : '') + error : text);
    if (error) return setState('error');
    if (text.trim() === lesson.x.trim()) {
      setState('ok');
      if (!done.includes(lesson.id)) {
        const next = [...done, lesson.id];
        setDone(next);
        write('pystep-done', next);
      }
    } else {
      setState('wrong');
    }
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const t = e.target;
    const s = t.selectionStart;
    setCode(code.slice(0, s) + '    ' + code.slice(t.selectionEnd));
    requestAnimationFrame(() => t.setSelectionRange(s + 4, s + 4));
  };

  const reset = () => {
    setCode(lesson.c);
    setOut('');
    setState('idle');
  };

  const drawer = html`
    <nav className="drawer glass" aria-label="Lessons">
      <div className="bar" aria-hidden="true">
        <i style=${{ width: (done.length / ALL.length) * 100 + '%' }}></i>
      </div>
      ${LEVELS.map(
        (l) => html`
          <div key=${l.name}>
            <h3>${l.name}</h3>
            ${l.lessons.map((x) => {
              const n = ALL.findIndex((a) => a.id === x.id);
              const isDone = done.includes(x.id);
              return html`
                <button
                  key=${x.id}
                  className=${'item' + (n === i ? ' cur' : '')}
                  onClick=${() => go(n)}
                  aria-current=${n === i ? 'true' : undefined}
                >
                  <span className=${'dot' + (isDone ? ' ok' : '')} aria-hidden="true">${isDone ? '✓' : n + 1}</span>
                  ${x.t}
                </button>
              `;
            })}
          </div>
        `
      )}
    </nav>
  `;

  const body = html`
    <div className="sheet-body">
      <p>${lesson.e}</p>
      <div className="grid">
        <div>
          <label className="lab" htmlFor="code">main.py</label>
          <textarea
            id="code"
            className="editor"
            value=${code}
            onChange=${(e) => setCode(e.target.value)}
            onKeyDown=${onKeyDown}
            spellCheck=${false}
            autoCapitalize="off"
            autoCorrect="off"
          ></textarea>
        </div>
        <div>
          <span className="lab">Output</span>
          <pre className="out" aria-live="polite">${out || (ready ? 'Press Run code to see the output.' : 'Loading Python...')}</pre>
        </div>
      </div>
      <span className="lab">Expected output</span>
      <pre className="exp">${lesson.x}</pre>
      <div className="row">
        <button className="btn" onClick=${run} disabled=${!ready || state === 'running'}>
          ${state === 'running' ? 'Running...' : 'Run code'}
        </button>
        <button className="pill" onClick=${reset}>Reset code</button>
        ${MESSAGES[state] && html`<span className=${'msg ' + state}>${MESSAGES[state]}</span>`}
      </div>
      <div className="row pager">
        <button className="pill" disabled=${i === 0} onClick=${() => go(i - 1)}>Previous lesson</button>
        <button className="pill" disabled=${i === ALL.length - 1} onClick=${() => go(i + 1)}>Next lesson</button>
      </div>
    </div>
  `;

  return html`
    <div className="app">
      <${Scene3D} lessons=${ALL} current=${i} done=${done} open=${open} onSelect=${go} />

      <header className="top glass">
        <div className="logo"><span className="mark">Py</span>PyStep</div>
        <div className="meta">
          <span>${done.length} of ${ALL.length} done</span>
          <button className="pill" onClick=${() => setMenu(!menu)} aria-expanded=${menu}>Lessons</button>
        </div>
      </header>

      ${menu && drawer}

      <p className="tip">Tap a planet to open its lesson</p>

      <section className=${'sheet glass' + (open ? ' open' : '')} aria-label="Current lesson">
        <div className="sheet-head">
          <div>
            <p className="sub">${lesson.level}, lesson ${i + 1} of ${ALL.length}</p>
            <h1>${lesson.t}</h1>
          </div>
          <button className="pill" onClick=${() => setOpen(!open)} aria-expanded=${open}>
            ${open ? 'Hide lesson' : 'Open lesson'}
          </button>
        </div>
        ${open && body}
      </section>
    </div>
  `;
}
