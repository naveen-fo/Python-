const BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
let loading;

// Loads Python (Pyodide, WebAssembly) once and reuses it.
export function getPyodide() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = BASE + 'pyodide.js';
      s.onload = () => window.loadPyodide({ indexURL: BASE }).then(resolve, reject);
      s.onerror = () => {
        loading = null;
        reject(new Error('Could not load Python. Check your internet connection and reload.'));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

// Runs code in a fresh namespace. Returns { text, error? }.
export async function runPython(code) {
  const pyodide = await getPyodide();
  const lines = [];
  pyodide.setStdout({ batched: (s) => lines.push(s) });
  pyodide.setStderr({ batched: (s) => lines.push(s) });
  const ns = pyodide.globals.get('dict')();
  ns.set('__name__', '__main__');
  try {
    await pyodide.runPythonAsync(code, { globals: ns });
    return { text: lines.join('\n') };
  } catch (e) {
    const msg = String(e.message || e).trim().split('\n').slice(-3).join('\n');
    return { text: lines.join('\n'), error: msg };
  } finally {
    ns.destroy();
  }
}
