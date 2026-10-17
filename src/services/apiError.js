export async function readApiError(response) {
  // Consume the stream once; JSON parsing must operate on the buffered text.
  const text = await response.text();
  let message = text.trim();
  try {
    const body = JSON.parse(text);
    const detail = body?.detail ?? body?.message ?? body?.error ?? body;
    message = typeof detail === "string" ? detail : JSON.stringify(detail);
  } catch {
    if (/^\s*</.test(text)) message = "O servidor retornou uma resposta inesperada. Verifique se a API está disponível.";
  }
  const error = new Error(message || `Não foi possível comunicar com a API (HTTP ${response.status}).`);
  error.status = response.status;
  return error;
}
