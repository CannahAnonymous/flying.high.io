(() => {
  const questions = [
    { q: "A friend shares something vulnerable. What does loyalty ask of you first?", a: ["Fix it quickly", "Listen without making it about me", "Promise I can solve it", "Change the subject"], correct: 1 },
    { q: "You realize you will miss a commitment. What is the trustworthy move?", a: ["Wait and hope it works out", "Disappear until it passes", "Say so early and renegotiate clearly", "Blame the circumstances"], correct: 2 },
    { q: "A boundary protects loyalty when it helps you…", a: ["Avoid every hard conversation", "Stay honest about what you can give", "Keep everyone happy", "Never change your mind"], correct: 1 },
    { q: "What turns an apology into repair?", a: ["A detailed excuse", "A promise to be perfect", "Naming the impact and changing the pattern", "Asking to be forgiven immediately"], correct: 2 },
    { q: "When motivation disappears, consistency looks like…", a: ["Lowering your standards forever", "Doing the next small thing you said you would", "Waiting for a better mood", "Working until you burn out"], correct: 1 },
    { q: "Which question is most useful before making a promise?", a: ["Will I look good saying yes?", "Can I honestly make space for this?", "Will anyone notice if I change it?", "How quickly can I agree?"], correct: 1 },
    { q: "A loyal relationship can hold both care and…", a: ["Silence", "Boundaries", "Perfection", "Agreement"], correct: 1 },
    { q: "The clearest proof of follow-through is usually…", a: ["A dramatic announcement", "A repeatable action no one has to chase", "A perfect first attempt", "A public explanation"], correct: 1 },
    { q: "When trust is shaken, the first useful step is to…", a: ["Demand instant closure", "Tell the truth about what happened", "Pretend it did not matter", "Make a bigger promise"], correct: 1 },
    { q: "A clear boundary sounds most like…", a: ["You always do this", "I cannot continue this conversation while we are shouting", "Do whatever you want", "I will never need anything"], correct: 1 },
    { q: "You can practice loyalty to yourself by…", a: ["Keeping every promise no matter the cost", "Making commitments that respect your actual capacity", "Ignoring your needs", "Waiting for permission"], correct: 1 },
    { q: "A dependable teammate makes expectations…", a: ["Mystical", "Visible and specific", "Flexible for everyone except them", "Unspoken"], correct: 1 },
    { q: "The kindest way to give feedback is to be…", a: ["Vague", "Specific and connected to the shared goal", "Public and surprising", "Silent"], correct: 1 },
    { q: "Repair asks for patience because trust is rebuilt through…", a: ["One perfect speech", "Consistent evidence over time", "Avoiding the person", "Winning the argument"], correct: 1 },
    { q: "Before saying yes, loyalty invites you to check your…", a: ["Image", "Capacity and intention", "Popularity", "Speed"], correct: 1 },
    { q: "When you change your mind responsibly, you should…", a: ["Hide it", "Communicate early and own the change", "Wait to be discovered", "Blame the original plan"], correct: 1 },
    { q: "A promise becomes meaningful when it has…", a: ["An audience", "A clear action behind it", "A dramatic feeling", "No deadline"], correct: 1 },
    { q: "The strongest standard is one you can…", a: ["Explain but never practice", "Repeat when no one is watching", "Use against other people", "Change for applause"], correct: 1 },
    { q: "A healthy commitment leaves room for…", a: ["Honest adjustment", "Resentment", "Fear of speaking", "Perfection"], correct: 0 }
  ];
  const today = new Date();
  const dateLabel = document.querySelector("#today-date");
  if (dateLabel) dateLabel.textContent = today.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  document.querySelector("#year").textContent = today.getFullYear();

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  const daySeed = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000);
  const dateKey = today.toISOString().slice(0, 10);
  const historyKey = "loyalty-academy-quiz-history";
  let quizState;
  try { quizState = JSON.parse(localStorage.getItem(historyKey) || "{}"); } catch { quizState = {}; }
  let history = Array.isArray(quizState.history) ? quizState.history.filter((index) => Number.isInteger(index) && index >= 0 && index < questions.length) : [];
  let daily = quizState.date === dateKey && Array.isArray(quizState.daily) ? quizState.daily.map((index) => questions[index]).filter(Boolean) : [];
  if (daily.length !== 5) {
    let available = questions.map((_, index) => index).filter((index) => !history.includes(index));
    if (available.length < 5) { history = []; available = questions.map((_, index) => index); }
    daily = available.sort((a, b) => ((a * 31 + daySeed) % 997) - ((b * 31 + daySeed) % 997)).slice(0, 5).map((index) => questions[index]);
    const dailyIndexes = daily.map((item) => questions.indexOf(item));
    try { localStorage.setItem(historyKey, JSON.stringify({ date: dateKey, daily: dailyIndexes, history: [...history, ...dailyIndexes] })); } catch { /* private browsing may block storage */ }
  }
  const quizForm = document.querySelector("#quiz-form");
  const questionText = document.querySelector("#question-text");
  const answerList = document.querySelector("#answer-list");
  const nextButton = document.querySelector("#next-question");
  const result = document.querySelector("#quiz-result");
  let current = 0; let score = 0;
  function renderQuestion() {
    const item = daily[current];
    document.querySelector("#question-count").textContent = `Question ${current + 1} of ${daily.length}`;
    const percent = Math.round(((current + 1) / daily.length) * 100);
    document.querySelector("#progress-label").textContent = `${percent}%`;
    document.querySelector("#progress-bar").style.width = `${percent}%`;
    questionText.textContent = item.q;
    answerList.innerHTML = item.a.map((answer, index) => `<label class="answer-option"><input type="radio" name="answer" value="${index}" required /><span>${answer}</span></label>`).join("");
    nextButton.innerHTML = current === daily.length - 1 ? "See my result <span aria-hidden=\"true\">→</span>" : "Lock in answer <span aria-hidden=\"true\">→</span>";
  }
  quizForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = quizForm.querySelector("input[name=answer]:checked");
    if (!selected) { answerList.querySelector("input")?.focus(); return; }
    if (Number(selected.value) === daily[current].correct) score++;
    current++;
    if (current < daily.length) { renderQuestion(); questionText.focus?.(); return; }
    quizForm.hidden = true; result.hidden = false;
    const remark = score === 5 ? "You are paying attention to the promises that shape a life." : score >= 3 ? "You have a strong instinct for loyalty. Keep practicing the moments that feel less obvious." : "Good practice starts with noticing. Choose one answer to live out today.";
    result.innerHTML = `<strong>${score} / ${daily.length} — ${score >= 3 ? "A solid start." : "Keep going."}</strong><span>${remark}</span><br><button type="button" class="button button-dark" id="reset-quiz">Try it again</button>`;
    document.querySelector("#reset-quiz").addEventListener("click", () => { current = 0; score = 0; quizForm.hidden = false; result.hidden = true; renderQuestion(); questionText.focus(); });
  });
  renderQuestion();

  const accountForm = document.querySelector("#account-form");
  accountForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    ["email-error", "password-error", "confirm-error", "terms-error"].forEach((id) => { document.getElementById(id).textContent = ""; });
    const email = document.querySelector("#email"); const password = document.querySelector("#password"); const confirm = document.querySelector("#password-confirm"); const terms = document.querySelector("#terms");
    let valid = true;
    if (!email.validity.valid) { document.querySelector("#email-error").textContent = "Enter a valid email address."; valid = false; }
    if (password.value.length < 8) { document.querySelector("#password-error").textContent = "Use at least 8 characters."; valid = false; }
    if (confirm.value !== password.value) { document.querySelector("#confirm-error").textContent = "Passwords do not match."; valid = false; }
    if (!terms.checked) { document.querySelector("#terms-error").textContent = "Please agree to the terms of practice."; valid = false; }
    if (!valid) { accountForm.querySelector("input:invalid, input[aria-invalid=true]")?.focus(); return; }
    document.querySelector("#account-success").hidden = false;
    document.querySelector("#account-success").textContent = "You’re in. Your first practice starts today.";
    accountForm.querySelector("button[type=submit]").disabled = true;
    document.querySelector("#member-path")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.querySelectorAll("[data-practice]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = button.parentElement.querySelector(".action-feedback");
      button.setAttribute("aria-pressed", "true");
      button.textContent = "Focus saved ✓";
      if (feedback) feedback.textContent = button.dataset.practice;
    });
  });

  const copyPrompt = document.querySelector("#copy-prompt");
  copyPrompt?.addEventListener("click", async () => {
    const prompt = "What would the most trustworthy version of you do next?";
    const feedback = document.querySelector("#copy-feedback");
    try {
      await navigator.clipboard.writeText(prompt);
      feedback.textContent = "Prompt copied.";
    } catch {
      feedback.textContent = prompt;
    }
  });

  const copySiteLink = document.querySelector("#copy-site-link");
  copySiteLink?.addEventListener("click", async () => {
    const link = "https://cannahanonymous.github.io/my-website/";
    const feedback = document.querySelector("#share-feedback");
    try {
      await navigator.clipboard.writeText(link);
      feedback.textContent = "Public link copied.";
    } catch {
      feedback.textContent = link;
    }
  });
})();
