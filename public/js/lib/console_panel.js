export const ConsolePanel = (() => {
  const logEl   = document.getElementById('logOutput')
  const probTbd = document.getElementById('problemsBody')
  const bLogs   = document.getElementById('badgeLogs')
  const bProb   = document.getElementById('badgeProblems')
  const panelEl = document.getElementById('consolePanel')

  let logCount = 0
  let problemCount = 0

  // helper to open panel
  const show = () => new mdb.Offcanvas(panelEl).show()

  // append log
  function log(msg, level = 'info') {
    logCount++
    bLogs.textContent = logCount
    const ts = new Date().toLocaleTimeString()
    const line = document.createElement('div')
    line.className = `log-${level}`
    line.textContent = `[${ts}] ${level.toUpperCase()} — ${msg}`
    logEl.appendChild(line)
    logEl.scrollTop = logEl.scrollHeight
  }

  // clear logs
  function clearLogs() {
    logEl.textContent = ''
    logCount = 0; bLogs.textContent = '0'
  }

  // problems table + editor marks
  let cmMarks = []

  function setProblems(list = []) {
    probTbd.innerHTML = ''
    problemCount = list.length
    bProb.textContent = problemCount

    list.forEach(p => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td><span class="badge ${p.severity === 'warning' ? 'bg-warning text-dark' : 'bg-danger'}">${p.severity}</span></td>
        <td>${p.line ?? '-'}</td>
        <td>${p.column ?? '-'}</td>
        <td>${p.message ?? ''}</td>`
      probTbd.appendChild(tr)

      // event to navigate by click → (right) to go to next problem
      tr.addEventListener('click', () => {
        if (window.editor && typeof p.line === 'number') {
          window.editor.setCursor({ line: p.line - 1, ch: p.column ? Math.max(p.column - 1, 0) : 0 })
          window.editor.focus()

          show()
          new mdb.Tab(document.querySelector('#console-tab-problems')).show()
        }
      })
    })

    // editor highlights (codemirror 5)
    if (window.editor) {
      // clear old marks
      cmMarks.forEach(m => m.clear())
      cmMarks = []

      try {
        window.editor.setOption('gutters', ['cm-gutter-problems', 'CodeMirror-linenumbers'])
      } catch (e) {
        console.error(e)
      }

      list.forEach(p => {
        if (typeof p.line === 'number') {
          const line = p.line - 1
          const ch   = Math.max((p.column || 1) - 1, 0)
          const toCh = window.editor.getLine(line)?.length ?? ch + 1

          const cls = p.severity === 'warning' ? 'cm-problem-warning' : 'cm-problem-error'
          cmMarks.push(window.editor.markText({ line, ch }, { line, ch: toCh }, { className: cls }))

          // gutter marker
          const mk = document.createElement('span')
          mk.className = `cm-marker ${p.severity === 'warning' ? 'cm-marker-warning' : 'cm-marker-error'}`
          window.editor.setGutterMarker(line, 'cm-gutter-problems', mk)
        }
      })
    }
  }

  // buttons to clean
  document.getElementById('btnClearLogs')?.addEventListener('click', clearLogs)
  document.getElementById('btnClearProblems')?.addEventListener('click', () => setProblems([]))

  // resize
  const handle = panelEl.querySelector('.resize-handle')
  if (!handle) throw new Error('ConsolePanel: missing resize handle element')

  let resizing = false, startY = 0, startH = 0
  handle.addEventListener('pointerdown', (e) => {
    resizing = true; startY = e.clientY; startH = panelEl.getBoundingClientRect().height; handle.setPointerCapture(e.pointerId)
  })

  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return
    const dy = startY - e.clientY; // arrastar pra cima aumenta
    const newH = Math.max(160, startH + dy)
    panelEl.style.height = newH + 'px'
  })

  handle.addEventListener('pointerup', () => { resizing = false; })

  return {
    show,
    log, info: (m)=>log(m,'info'), warn: (m)=>log(m,'warn'), error: (m)=>log(m,'error'),
    clearLogs, setProblems
  }
})()

window.ConsolePanel = ConsolePanel
