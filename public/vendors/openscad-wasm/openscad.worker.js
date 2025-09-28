import OpenSCAD from "/js/openscad-wasm/openscad.js"
let instance

onmessage = async ({data}) => {
  const {scad, out = "model.stl", args = []} = data

  instance ??= await OpenSCAD({noInitialRun: true, locateFile: p => `/js/openscad-wasm/${p}`})

  instance.FS.writeFile("/input.scad", scad)
  instance.callMain(["/input.scad", "--enable=manifold", "-o", out, ...args])

  const stl = instance.FS.readFile("/" + out)
  postMessage(stl, [stl.buffer])
}
