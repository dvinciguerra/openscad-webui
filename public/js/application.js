document.addEventListener('DOMContentLoaded', async () => {
  // codemirror editor setup
  CodeMirror.defineSimpleMode("scad", {
    start: [
      {regex: /"(?:[^\\]|\\.)*?"/, token: "string"},
      {regex: /(?:module|function|include|use)\b/, token: "scad-special"},
      {regex: /(?:for|if|else)\b/, token: "scad-keyword"},
      {regex: /(?:translate|rotate|scale|mirror|multmatrix|color|minkowski|hull|union|difference|intersection|render)\b/, token: "scad-keyword"},
      {regex: /(?:circle|square|polygon|text|sphere|cube|cylinder|polyhedron)\b/, token: "scad-keyword"},
      {regex: /(?:children|each|undef)\b/, token: "scad-keyword"},
      {regex: /\/\/.*/, token: "comment"},
      {regex: /\/\*.*\*\//, token: "comment"},
      {regex: /[-+\/*=<>!]+/, token: "operator"},
      {regex: /[\d.]+/, token: "number"},
      {regex: /[\w$]+/, token: "variable"},
      {regex: /[\{\}\[\]\(\);,]/, token: "bracket"}
    ],
    meta: {
      dontIndentStates: ["comment"],
      lineComment: "//"
    }
  });

  const editorElement = document.getElementById('code-editor');
  const localStorageCodeKey = 'scad_editor_content';
  const localStorageSettingsKey = 'scad_editor_settings';

  const defaultSettings = {
    editorFontSize: 16,
    renderFN: 50
  };

  // Carregar configurações do localStorage (se existirem)
  let settings = defaultSettings;
  const savedSettings = localStorage.getItem(localStorageSettingsKey);
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
  }

  // Aplicar configurações nos inputs
  document.getElementById('editorFontSize').value = settings.editorFontSize;
  document.getElementById('renderFN').value = settings.renderFN;

  // Atualizar configurações ao alterar inputs
  document.getElementById('nav-pane-settings').addEventListener('input', (event) => {
    if (event.target.id === 'editorFontSize') {
      settings.editorFontSize = parseInt(event.target.value, 10);
      editor.getWrapperElement().style.fontSize = `${settings.editorFontSize}px`;
    } else if (event.target.id === 'renderFN') {
      settings.renderFN = parseInt(event.target.value, 10);
    }
    localStorage.setItem(localStorageSettingsKey, JSON.stringify(settings));
  });

  // Carregar conteúdo do localStorage (se existir)
  const savedContent = localStorage.getItem(localStorageCodeKey);
  if (savedContent) {
    editorElement.value = savedContent;
  }

  // Inicializa o CodeMirror com o tema e as configurações carregadas
  const editor = CodeMirror.fromTextArea(editorElement, {
    lineNumbers: true,
    mode: 'scad',
    theme: 'material',
    lineWrapping: true,
  });
  editor.getWrapperElement().style.fontSize = `${settings.editorFontSize}px`;

  const previewCanvas = document.getElementById('preview-canvas');

  // Atualiza o localStorage e a pré-visualização ao digitar
  editor.on('change', () => {
    const content = editor.getValue();
    localStorage.setItem(localStorageCodeKey, content);
  });

  // Força o CodeMirror a se redimensionar e renderiza o preview
  const editorTab = document.getElementById('nav-tab-editor');
  editorTab.addEventListener('shown.bs.tab', () => {
    // editor.refresh();
  });

  const previewTab = document.getElementById('nav-tab-preview');
  previewTab.addEventListener('shown.bs.tab', () => {
    // renderAndPreview();
  });

  // Renderiza o preview na inicialização
  if (savedContent) {
     // renderAndPreview();
  }

  // Listener para redimensionamento do canvas
  window.addEventListener('resize', () => {
      const width = previewCanvas.clientWidth;
      const height = previewCanvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
  });
});
