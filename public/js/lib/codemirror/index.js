export const SCAD_NAME = "scad"
export const SCAD_MODE = {
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
}
