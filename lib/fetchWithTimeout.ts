/**
 * Fetcher with AbortController timeout (default 8s).
 * Drop-in replacement for global fetch() on the client side.
 * Also works as a SWR fetcher: `useSWR(url, fetchWithTimeout)`.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(
        errorBody?.error || errorBody?.message || `Erreur HTTP ${res.status}`
      );
    }

    return res.json();
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        "La requête a pris trop de temps. Vérifiez votre connexion et réessayez."
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * SWR-compatible fetcher with timeout.
 * Usage: `useSWR("/api/talents/me", swrFetcher)`
 */
export const swrFetcher = (url: string) => fetchWithTimeout(url);
