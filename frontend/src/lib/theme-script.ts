// Kept free of React imports so the server-rendered layout can inline it.
export const THEME_KEY = "cursus.theme";

// Runs in <head> before first paint so a saved theme never flashes.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
