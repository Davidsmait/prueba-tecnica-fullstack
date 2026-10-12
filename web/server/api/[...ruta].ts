// BFF: el navegador nunca ve el token; el servidor de Nuxt lo agrega al reenviar a la API.
export default defineEventHandler((event) => {
  const { apiBase, apiToken } = useRuntimeConfig(event);
  const ruta = getRouterParam(event, 'ruta') ?? '';
  const query = getRequestURL(event).search;

  return proxyRequest(event, `${apiBase}/${ruta}${query}`, {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
});
