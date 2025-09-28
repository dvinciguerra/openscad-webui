export const ConsolePanel = (() => {
  const logEl   = document.getElementById('logOutput');
  const probTbd = document.getElementById('problemsBody');
  const bLogs   = document.getElementById('badgeLogs');
  const bProb   = document.getElementById('badgeProblems');
  const panelEl = document.getElementById('consolePanel');

  let logCount = 0;
  let problemCount = 0;

  // Helper para abrir painel
  const show = () => new mdb.Offcanvas(panelEl).show();

  // Append log line
  function log(msg, level = 'info') {
    logCount++;
    bLogs.textContent = logCount;
    const ts = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `log-${level}`;
    line.textContent = `[${ts}] ${level.toUpperCase()} — ${msg}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // Clear logs
  function clearLogs() {
    logEl.textContent = '';
    logCount = 0; bLogs.textContent = '0';
  }

  // Problems table + editor marks (opcional)
  let cmMarks = []; // para limpar depois

  function setProblems(list = []) {
    // table
    probTbd.innerHTML = '';
    problemCount = list.length;
    bProb.textContent = problemCount;

    list.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge ${p.severity === 'warning' ? 'bg-warning text-dark' : 'bg-danger'}">${p.severity}</span></td>
        <td>${p.line ?? '-'}</td>
        <td>${p.column ?? '-'}</td>
        <td>${p.message ?? ''}</td>`;
      probTbd.appendChild(tr);

      // click → ir para linha no editor
      tr.addEventListener('click', () => {
        if (window.editor && typeof p.line === 'number') {
          window.editor.setCursor({ line: p.line - 1, ch: p.column ? Math.max(p.column - 1, 0) : 0 });
          window.editor.focus();
          // garante que o painel está aberto
          show();
          // muda para aba Problems
          new mdb.Tab(document.querySelector('#console-tab-problems')).show();
        }
      });
    });

    // editor highlights (se tiver editor CodeMirror 5)
    if (window.editor) {
      // limpar anteriores
      cmMarks.forEach(m => m.clear());
      cmMarks = [];

      // gutter opcional
      try {
        window.editor.setOption('gutters', ['cm-gutter-problems', 'CodeMirror-linenumbers']);
      } catch (e) {}

      list.forEach(p => {
        if (typeof p.line === 'number') {
          const line = p.line - 1;
          const ch   = Math.max((p.column || 1) - 1, 0);
          const toCh = window.editor.getLine(line)?.length ?? ch + 1;

          const cls = p.severity === 'warning' ? 'cm-problem-warning' : 'cm-problem-error';
          cmMarks.push(window.editor.markText({ line, ch }, { line, ch: toCh }, { className: cls }));

          // gutter marker
          const mk = document.createElement('span');
          mk.className = `cm-marker ${p.severity === 'warning' ? 'cm-marker-warning' : 'cm-marker-error'}`;
          window.editor.setGutterMarker(line, 'cm-gutter-problems', mk);
        }
      });
    }
  }

  // limpezas via botões
  document.getElementById('btnClearLogs')?.addEventListener('click', clearLogs);
  document.getElementById('btnClearProblems')?.addEventListener('click', () => setProblems([]));

  // resize por arraste
  const handle = panelEl.querySelector('.resize-handle');
  let resizing = false, startY = 0, startH = 0;
  handle.addEventListener('pointerdown', (e) => {
    resizing = true; startY = e.clientY; startH = panelEl.getBoundingClientRect().height; handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    const dy = startY - e.clientY; // arrastar pra cima aumenta
    const newH = Math.max(160, startH + dy);
    panelEl.style.height = newH + 'px';
  });
  handle.addEventListener('pointerup', () => { resizing = false; });

  return {
    show,
    log, info: (m)=>log(m,'info'), warn: (m)=>log(m,'warn'), error: (m)=>log(m,'error'),
    clearLogs, setProblems
  };
})();

window.ConsolePanel = ConsolePanel; // opcional: global
