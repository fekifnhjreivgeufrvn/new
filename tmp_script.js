
(function () {
  try {
    var saved = localStorage.getItem("sixroll_theme");
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved === "light" || saved === "dark" ? saved : (dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
