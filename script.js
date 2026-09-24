(() => {
  const today = new Date();
  document.querySelector("#year").textContent = today.getFullYear();
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  const search = document.querySelector("#produce-search");
  const filter = document.querySelector("#role-filter");
  const listings = [...document.querySelectorAll(".listing")];
  const empty = document.querySelector("#empty-listings");
  function filterListings() {
    const term = search.value.trim().toLowerCase();
    const role = filter.value;
    let visible = 0;
    listings.forEach((listing) => {
      const matches = (!term || listing.dataset.search.includes(term)) && (role === "all" || listing.dataset.role === role);
      listing.hidden = !matches;
      if (matches) visible++;
    });
    empty.hidden = visible > 0;
  }
  search?.addEventListener("input", filterListings);
  filter?.addEventListener("change", filterListings);
  document.querySelectorAll("[data-interest]").forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "Interest noted ✓";
      button.setAttribute("aria-pressed", "true");
    });
  });

  let selectedRole = "farmer";
  document.querySelectorAll(".role-choice").forEach((button) => {
    button.addEventListener("click", () => {
      selectedRole = button.dataset.role;
      document.querySelectorAll(".role-choice").forEach((choice) => {
        const selected = choice === button;
        choice.classList.toggle("is-selected", selected);
        choice.setAttribute("aria-pressed", String(selected));
      });
    });
  });
  document.querySelectorAll("[data-role-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.querySelector(`.role-choice[data-role="${link.dataset.roleLink}"]`);
      target?.click();
    });
  });

  const joinForm = document.querySelector("#join-form");
  joinForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    let valid = true;
    ["name", "contact", "location"].forEach((field) => {
      const input = document.querySelector(`#join-${field}`);
      const error = document.querySelector(`#${field}-error`);
      error.textContent = "";
      if (!input.value.trim()) { error.textContent = "This field is required."; valid = false; }
    });
    if (!valid) { joinForm.querySelector("input:invalid, input:not(:placeholder-shown)")?.focus(); return; }
    const labels = { farmer: "farmer", agent: "agent", buyer: "buyer" };
    const success = document.querySelector("#join-success");
    success.hidden = false;
    success.textContent = `Thanks—your ${labels[selectedRole]} interest is saved for this demo. We’ll show the next step here when onboarding is connected.`;
    joinForm.querySelector("button[type=submit]").disabled = true;
  });
})();
