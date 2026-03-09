(function () {
  const KEY = "apatheia.workstation.v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (_error) {
      return {};
    }
  }

  function save(payload) {
    localStorage.setItem(KEY, JSON.stringify(payload));
  }

  window.workstationStorage = { load, save };
})();
