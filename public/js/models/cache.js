
export const KEYS = {
  CODE: 'scad_editor_code',
  SETTINGS: 'scad_editor_settings'
}

export const cacheStore = async (key, blob, name) => {
  const cache = await caches.open(key)
  await cache.put(name, new Response(blob))
}

export const cacheFetch = async (key, name) => {
  const cache = await caches.open(key)
  const response = await cache.match(name)

  if (response) return response.blob()
  return undefined
}
