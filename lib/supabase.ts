import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://seteigcwsvyitnawgarw.supabase.co";
const supabaseAnonKey = "sb_publishable_bjtihg061pWEhTRtzMKeDA_EyswS..."; // Collez ici la clé complète que vous venez de copier

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
