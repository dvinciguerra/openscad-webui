import './lib/stl-viewer/stl-viewer.js'
import OpenSCAD from "/vendors/openscad-wasm/openscad.js"

import {encode as sha1} from './lib/digest.js'
import {SCAD_MODE, SCAD_NAME} from './lib/codemirror/index.js'
import {KEYS} from './models/cache.js'
import {setState, fetchState} from "./models/state.js"


document.addEventListener('DOMContentLoaded', async () => {
  const editorElement = document.getElementById('code-editor');
  const localStorageCodeKey = 'scad_editor_content';
  const localStorageSettingsKey = 'scad_editor_settings';

  const defaultSettings = {
    editorFontSize: 16,
    renderFN: 50
  };

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

  // load settings from localStorage if exists
  let settings = defaultSettings;
  const savedSettings = localStorage.getItem(localStorageSettingsKey);
  if (savedSettings) {
    settings = JSON.parse(savedSettings);
  }

  // settings inputs
  document.getElementById('editorFontSize').value = settings.editorFontSize;
  document.getElementById('renderFN').value = settings.renderFN;

  // load saved code from localStorage if exists
  const savedContent = localStorage.getItem(localStorageCodeKey);
  if (savedContent) {
    editorElement.value = savedContent;
  }

  // codemirror editor instance
  const editor = CodeMirror.fromTextArea(editorElement, {
    lineNumbers: true,
    mode: 'scad',
    theme: 'material',
    lineWrapping: true,
  });

  // apply saved font size
  editor.getWrapperElement().style.fontSize = `${settings.editorFontSize}px`;

  // save code to localStorage on change
  editor.on('change', () => {
    const content = editor.getValue();
    localStorage.setItem(localStorageCodeKey, content);
  });

  // blob caching
  const CACHE_NAME = 'openscad_model_cache';

  // save model (stl blob) to cache
  const cacheStore = async (blob, name) => {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(name, new Response(blob));
  };

  // fetch model (stl blob) from cache
  const cacheFetch = async (name) => {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(name);
    if (response) {
      return response.blob();
    }
    return undefined;
  };

  // editor tab
  const editorTab = document.getElementById('nav-tab-editor');
  editorTab.addEventListener('shown.bs.tab', () => {
    editor.refresh();
  });

  // preview tab
  const previewTab = document.getElementById('nav-tab-preview')
  previewTab.addEventListener('shown.bs.tab', async () => {
    const openscad = await OpenSCAD({noInitialRun: true, locateFile: (path) => `/js/openscad-wasm/${path}`})

    const scad = editor.getValue()

    openscad.FS.writeFile("/input.scad", scad)
    openscad.callMain(["/input.scad", "--enable=manifold", "-o", "model.stl"])

    const bytes = openscad.FS.readFile("/model.stl")
    const blob = new Blob([bytes], {type: "model/stl"})
    // await cacheStore(blob, 'model.stl');
    const url = URL.createObjectURL(blob)

    const viewer = document.getElementById("preview-canvas")
    viewer.model = url

    console.log("STL model loaded into viewer")
    URL.revokeObjectURL(url);
  });

  // load cached blob if exists
  if (savedContent) {
    // const retrivedBlob = await cacheFetch('model.stl')
    // if (retrivedBlob) {
    //   const blob = await retrievedBlob.text()
    //   console.log('Content of retrieved blob:', blob);
    // }
  }
});
