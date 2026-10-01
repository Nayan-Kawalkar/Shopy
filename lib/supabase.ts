import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking"; // for redirect
import { openAuthSessionAsync } from "expo-web-browser";
import { AppState, Platform } from "react-native";

// Schema lives in supabase/migrations; sample rowss in supabase/seed.sql.
export interface Agent {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  avatar: string | null;
}

export interface Review {
  id: string;
  created_at: string;
  property_id: string;
  name: string;
  avatar: string | null;
  review: string | null;
  rating: number | null;
}

export interface Gallery {
  id: string;
  created_at: string;
  property_id: string;
  image: string;
}

export interface Property {
  id: string;
  created_at: string;
  name: string;
  type: string | null;
  description: string | null;
  address: string | null;
  image: string | null;
  price: number | null;
  area: number | null;
  rating: number | null;
  fertilizers_percentage: string | null;
  pesticides_insecticides: string | null;
  facilities: string[];
  agent_id: string | null;
}

export interface PropertyDetails extends Property {
  agent: Agent | null;
  galleries: Gallery[];
  reviews: Review[];
}

export interface Article {
  id: string;
  created_at: string;
  name: string;
  type: string[];
  date: string | null;
  image: string | null;
  description: string | null;
  farm_size: string | null;
  crop_yield: string | null;
  organic: string | null;
  section_titles: string[];
  section_texts: string[];
  technologies: string[];
  gallery: string[];
  location: string | null;
  conclusion: string | null;
  agent_id: string | null;
  agent: Agent | null;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Publishable (sb_publishable_...) or legacy anon key. Never put the secret key here.
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase is not configured: set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in .env.local. Data and login will not work."
  );
}

// Static web rendering evaluates this module in Node, where AsyncStorage has no localStorage.
const isServer = typeof window === "undefined";

export const supabase = createClient(
  supabaseUrl || "http://localhost:54321",
  supabaseKey || "missing-supabase-key",
  {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  }
);

// Only refresh tokens while the app is in the foreground (recommended for React Native).
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUri, skipBrowserRedirect: true },
    });
    if (error) throw error;

    const browserResult = await openAuthSessionAsync(data.url, redirectUri);

    if (browserResult.type !== "success") {
      throw new Error("OAuth2 authentication failed");
    }

    const { queryParams } = Linking.parse(browserResult.url);
    if (queryParams?.error_description) {
      throw new Error(String(queryParams.error_description));
    }

    const code = queryParams?.code;
    if (typeof code !== "string") {
      throw new Error("Missing auth code in the redirect URL");
    }

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError) throw sessionError;

    return true;
  } catch (error) {
    console.error("Login Error:", error);
    return false;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;

    const user = session?.user;
    if (!user) return null;

    // Google fills full_name / avatar_url in the user metadata.
    const metadata = user.user_metadata ?? {};
    return {
      id: user.id,
      name: metadata.full_name ?? metadata.name ?? user.email ?? "",
      email: user.email ?? "",
      avatar: metadata.avatar_url ?? metadata.picture ?? null,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Turns user input into an ilike pattern, dropping characters that are special
// in PostgREST filter strings (, ( )) or in LIKE patterns (% _ *).
function toSearchPattern(query: string) {
  return `%${query.replace(/[,()%_*\\"]/g, " ").trim()}%`;
}

export async function getLatestProperties() {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(5);
    if (error) throw error;
    return data as Property[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    let request = supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter && filter !== "All") request = request.eq("type", filter);

    if (query) {
      const pattern = toSearchPattern(query);
      request = request.or(
        `name.ilike.${pattern},address.ilike.${pattern},type.ilike.${pattern}`
      );
    }

    if (limit) request = request.limit(limit);

    const { data, error } = await request;
    if (error) throw error;
    return data as Property[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getPropertyById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*, agent:agents(*), galleries(*), reviews(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as PropertyDetails | null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getLatestArticle() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, agent:agents(*)")
      .order("created_at", { ascending: true })
      .limit(5);
    if (error) throw error;
    return data as Article[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getArticle({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    let request = supabase
      .from("articles")
      .select("*, agent:agents(*)")
      .order("created_at", { ascending: false });

    // `type` is a tag array, so match articles that carry the selected tag.
    if (filter && filter !== "All") request = request.contains("type", [filter]);

    if (query) {
      const pattern = toSearchPattern(query);
      request = request.or(
        `name.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`
      );
    }

    if (limit) request = request.limit(limit);

    const { data, error } = await request;
    if (error) throw error;
    return data as Article[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getArticleById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*, agent:agents(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as Article | null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
