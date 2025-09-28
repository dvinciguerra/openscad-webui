import './lib/stl-viewer/stl-viewer.js'
import OpenSCAD from "/vendors/openscad-wasm/openscad.js"

import {encode as sha1} from './lib/digest.js'
import {SCAD_MODE, SCAD_NAME} from './lib/codemirror/index.js'
import {KEYS} from './models/cache.js'
import {setState, fetchState} from "./models/state.js"


document.addEventListener('DOMContentLoaded', async () => {
  window.FIRST_RUN = true

  const editorElement = document.getElementById('code-editor')
  const codeKey = KEYS.CODE
  const settingsKey = KEYS.SETTINGS

  const defaultSettings = {
    editorFontSize: 16,
    renderFN: 50
  }

  const defaultCode = 'cube(100);'
  const defaulEditorState = {
    code: defaultCode,
    checksum: await sha1(defaultCode)
  }

  // codemirror editor setup
  CodeMirror.defineSimpleMode(SCAD_NAME, SCAD_MODE)

  const editorStateUpdate = async (currentState = {}) => {
    currentState.checksum = await sha1(currentState.code)

    const previousState = fetchState(codeKey, {})
    if (previousState.checksum !== currentState.checksum) setState(codeKey, currentState)

    return currentState
  }

  const hasEditorChanged = async (currentState = {}) => {
    currentState.checksum = await sha1(currentState.code)

    const previousState = fetchState(codeKey, {})
    return previousState.checksum != currentState.checksum
  }

  const needBuild = async (currentState = {}) => {
    currentState.checksum = await sha1(currentState.code)

    const previousState = fetchState(codeKey, {})

    const needToBeUpdated = (previousState.lastBuild !== currentState.checksum)
    console.log(previousState.checksum, currentState.checksum, needToBeUpdated)
    console.log(previousState, currentState)
    if (!needToBeUpdated) return false

    setState(codeKey, {...previousState, ...currentState, lastBuild: currentState.checksum})
    return true
  }

  // codemirror editor instance
  const editor = CodeMirror.fromTextArea(editorElement, {
    lineNumbers: true,
    mode: 'scad',
    theme: 'material',
    lineWrapping: true,
  })

  const editorState = fetchState(codeKey, defaulEditorState)
  if (editorState) editor.setValue(editorState.code || defaultCode)


  // save code state every change
  editor.on('change', () => {
    const currentState = fetchState(codeKey, {})
    currentState.code = editor.getValue()
    editorStateUpdate(currentState)
  })

  // blob caching
  const CACHE_NAME = 'openscad_model_cache'

  // editor tab
  const editorTab = document.getElementById('nav-tab-editor')
  editorTab.addEventListener('shown.bs.tab', async () => {
    const changed = await hasEditorChanged({code: editor.getValue()})
    console.log('Editor changed?', changed)
    editor.refresh()
  })

  // preview tab
  const previewTab = document.getElementById('nav-tab-preview')
  previewTab.addEventListener('shown.bs.tab', async () => {
    const needToBuildModel = await needBuild({code: editor.getValue()})

    // skip initial build on page load and
    //  skips build if code checksum is diferent that last build checksum
    if (!needToBuildModel && !window.FIRST_RUN) {
      console.log('Skipping build, code not changed')
      return
    }

    console.log([needToBuildModel, window.FIRST_RUN])
    window.FIRST_RUN = false

    // TODO: show loading status

    // build model
    const openscad = await OpenSCAD({noInitialRun: true, locateFile: (path) => `/vendors/openscad-wasm/${path}`})
    const scad = editor.getValue()

    let blob
    try {
      openscad.FS.writeFile("/input.scad", scad)
      openscad.callMain(["/input.scad", "--enable=manifold", "-o", "model.stl"])

      const bytes = openscad.FS.readFile("/model.stl")
      blob = new Blob([bytes], {type: "model/stl"})
    }
    catch (e) {
      alert('Compile Error: cannot be able to compile scad.')
      return
    }

    // await cacheStore(blob, 'model.stl')
    const url = URL.createObjectURL(blob)

    const viewer = document.getElementById("preview-model")
    viewer.model = url

    URL.revokeObjectURL(url)
  })
})
