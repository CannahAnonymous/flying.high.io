(() => {
  const apiBase = (window.SHAMBALINK_API_URL || "").replace(/\/$/, "");
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

  const swahili = {
    "How it works": "Jinsi inavyofanya kazi", "Browse produce": "Tazama mazao", "Join the network": "Jiunge na mtandao",
    "Get started": "Anza sasa", "A clearer route from field to table": "Njia rahisi kutoka shambani hadi mezani",
    "Good food should": "Chakula bora kinapaswa", "move fairly.": "kusafirishwa kwa haki.", "See what’s available": "Tazama yanayopatikana",
    "Learn the route": "Jifunze njia", "One network, three roles": "Mtandao mmoja, nafasi tatu", "Farmers": "Wakulima", "Agents": "Mawakala",
    "Buyers": "Wanunuzi", "Find your place": "Pata nafasi yako", "in the harvest.": "katika mavuno.", "Example market board": "Ubao wa soko",
    "What’s moving": "Kinachosafirishwa", "this week.": "wiki hii.", "All listings": "Matangazo yote", "Farmer listings": "Matangazo ya wakulima",
    "Agent coordinated": "Yaliyoratibiwa na wakala", "The route": "Njia", "Less guessing.": "Makisio kidogo.", "More moving.": "Usafirishaji zaidi.",
    "Start with your role": "Anza na nafasi yako", "Put your work": "Weka kazi yako", "on the map.": "kwenye ramani.",
    "I’m a farmer": "Mimi ni mkulima", "I’m an agent": "Mimi ni wakala", "I’m a buyer": "Mimi ni mnunuzi",
    "Your name or business": "Jina lako au biashara", "Phone or email": "Simu au barua pepe", "Request details": "Omba maelezo",
    "Ready now": "Tayari sasa", "Route forming": "Njia inaundwa", "New listing": "Tangazo jipya", "Ask Shamba AI": "Uliza Shamba AI",
    "What grows in Tanzania?": "Nini hulimwa Tanzania?", "How do I list maize?": "Nitawekaje mahindi?", "Help me buy rice": "Nisaidie kununua mpunga",
    "Copy link": "Nakili kiungo", "Save my interest": "Hifadhi nia yangu", "Language / Lugha": "Lugha / Language"
  };
  function translatePage(language) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const key = node.nodeValue.trim();
      if (!key || node.parentElement.closest("script,style")) return;
      if (!node.dataset.originalText) node.dataset.originalText = node.nodeValue;
      const original = node.dataset.originalText.trim();
      if (language === "sw" && swahili[original]) node.nodeValue = node.nodeValue.replace(original, swahili[original]);
      if (language === "en") node.nodeValue = node.dataset.originalText;
    });
    document.querySelectorAll("input[placeholder]").forEach((input) => {
      if (!input.dataset.originalPlaceholder) input.dataset.originalPlaceholder = input.placeholder;
      if (language === "sw" && input.dataset.originalPlaceholder === "Search produce…") input.placeholder = "Tafuta mazao…";
      if (language === "en") input.placeholder = input.dataset.originalPlaceholder;
    });
  }
  document.querySelectorAll(".language-button").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".language-button").forEach((item) => item.classList.toggle("is-active", item === button));
    document.documentElement.lang = button.dataset.language === "sw" ? "sw" : "en";
    translatePage(button.dataset.language);
  }));

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
    const payload = { role: selectedRole, name: document.querySelector("#join-name").value.trim(), contact: document.querySelector("#join-contact").value.trim(), location: document.querySelector("#join-location").value.trim() };
    const saveInterest = apiBase
      ? fetch(`${apiBase}/api/interests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((response) => {
        if (!response.ok) throw new Error("The service could not save your interest.");
        return response.json();
      })
      : Promise.resolve();
    saveInterest.then(() => {
      success.hidden = false;
      success.textContent = apiBase ? `Thanks—your ${labels[selectedRole]} interest is now in the ShambaLink network.` : `Thanks—your ${labels[selectedRole]} interest is saved for this demo. We’ll show the next step here when onboarding is connected.`;
      joinForm.querySelector("button[type=submit]").disabled = true;
    }).catch(() => {
      success.hidden = false;
      success.textContent = "We could not reach ShambaLink right now. Please try again.";
    });
  });

  const assistantToggle = document.querySelector("#assistant-toggle");
  const assistantPanel = document.querySelector("#assistant-panel");
  const assistantClose = document.querySelector("#assistant-close");
  const assistantInput = document.querySelector("#assistant-input");
  const assistantResponse = document.querySelector("#assistant-response");
  function answerAssistant(question) {
    const text = question.toLowerCase();
    if (text.includes("tanzania") || text.includes("crop") || text.includes("zao")) return "Tanzania grows maize, rice, cassava, beans, coffee, cashew, sunflower, sesame, bananas and tomatoes. Start by choosing a region and harvest timing.";
    if (text.includes("maize") || text.includes("mahindi")) return "To list maize, choose Farmer, add your name, contact, location, quantity and harvest timing. An agent can then help coordinate collection.";
    if (text.includes("rice") || text.includes("mpunga") || text.includes("buy")) return "Buyers can search the market board, filter by agent or farmer, then request details from the listing that matches their quantity and pickup needs.";
    return "I can help with Tanzanian crops, listing a harvest, finding produce, or choosing the right ShambaLink role.";
  }
  assistantToggle?.addEventListener("click", () => {
    const open = assistantToggle.getAttribute("aria-expanded") === "true";
    assistantToggle.setAttribute("aria-expanded", String(!open));
    assistantPanel.hidden = open;
    if (!open) assistantInput.focus();
  });
  assistantClose?.addEventListener("click", () => { assistantPanel.hidden = true; assistantToggle.setAttribute("aria-expanded", "false"); });
  document.querySelectorAll(".assistant-suggestions button").forEach((button) => button.addEventListener("click", () => {
    assistantInput.value = button.textContent;
    assistantResponse.textContent = answerAssistant(button.textContent);
  }));
  document.querySelector("#assistant-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    assistantResponse.textContent = answerAssistant(assistantInput.value);
  });
})();
