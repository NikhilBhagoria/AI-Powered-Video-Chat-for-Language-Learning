const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function translateText(text, targetLanguage) {
  const res = await fetch(`${API_URL}/ai/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLanguage }),
  });
  const data = await res.json();
  return data.translation;
}

export async function correctText(text, language) {
  const res = await fetch(`${API_URL}/ai/correct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  const data = await res.json();
  return data.correction;
}