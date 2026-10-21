/**
 * Formate un identifiant pour les tableaux Netacuv.
 * Doit impérativement commencer par "NTCV" et ajouter les chiffres dans la bonne logique séquentielle.
 * 
 * Exemples :
 * - formatTableId(1) => "NTCV-0001"
 * - formatTableId(25) => "NTCV-0025"
 * - formatTableId("cmuq4ytqp000df1a7gupxaxgu", 1) => "NTCV-0001"
 */
export function formatTableId(identifierOrIndex: string | number, fallbackIndex?: number, prefix = "NTCV"): string {
  // 1. Si un index séquentiel explicite est fourni en second paramètre (ex: (page - 1) * limit + idx + 1)
  if (typeof fallbackIndex === "number" && Number.isFinite(fallbackIndex) && fallbackIndex > 0) {
    return `${prefix}-${String(fallbackIndex).padStart(4, "0")}`;
  }

  // 2. Si le premier paramètre est un nombre
  if (typeof identifierOrIndex === "number" && Number.isFinite(identifierOrIndex)) {
    const val = identifierOrIndex > 0 ? identifierOrIndex : 1;
    return `${prefix}-${String(val).padStart(4, "0")}`;
  }

  // 3. Si c'est déjà une chaîne commençant par NTCV avec des chiffres
  if (typeof identifierOrIndex === "string" && /^NTCV-?\d+/i.test(identifierOrIndex)) {
    const digits = identifierOrIndex.replace(/\D/g, "");
    return `${prefix}-${digits.padStart(4, "0")}`;
  }

  // 4. Si c'est un identifiant chaîne (ex: CUID/UUID), extraire un hash numérique déterministe entre 1001 et 9999
  if (typeof identifierOrIndex === "string" && identifierOrIndex.trim()) {
    let hash = 0;
    const str = identifierOrIndex.trim();
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const num = (Math.abs(hash) % 9000) + 1000; // 1000 à 9999
    return `${prefix}-${String(num).padStart(4, "0")}`;
  }

  return `${prefix}-0001`;
}
