import "./state.js";
import "./data.js";
import "./navigation.js";
import "./render-overview.js";
import "./render-issues.js";
import "./render-profiles.js";
import "./render-evidence.js";
import "./render-analytics.js";
import { startSupabaseMerge } from "./supabase.js";

window.__APATHEIA_MANUAL_INIT__ = true;
const app = await import("../app.js");
await app.init();
startSupabaseMerge();
