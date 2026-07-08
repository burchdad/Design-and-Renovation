(function () {
  const root = document.createElement("div");
  root.className = "helper-agent";
  root.innerHTML = `
    <button class="helper-agent-toggle" type="button" aria-expanded="false" aria-controls="helperAgentPanel">
      Website Help
    </button>
    <section class="helper-agent-panel" id="helperAgentPanel" hidden>
      <div class="helper-agent-header">
        <div>
          <strong>Haven Website Helper</strong>
          <span>Ask a project or website question.</span>
        </div>
        <button class="helper-agent-close" type="button" aria-label="Close website helper">×</button>
      </div>
      <div class="helper-agent-body">
        <p class="helper-agent-reply">I can help route project questions, form issues, payment questions, or website support requests to the right place.</p>
        <form class="helper-agent-form">
          <label>Name</label>
          <input name="name" type="text" autocomplete="name" placeholder="Your name">
          <label>Email</label>
          <input name="email" type="email" autocomplete="email" placeholder="you@example.com">
          <label>What do you need help with?</label>
          <select name="category">
            <option>Project Question</option>
            <option>Inquiry/Form Issue</option>
            <option>Payment Question</option>
            <option>Website Support</option>
          </select>
          <label>Message</label>
          <textarea name="message" rows="4" placeholder="Tell us what you need..." required></textarea>
          <button class="btn btn-primary" type="submit">Send Request</button>
          <p class="helper-agent-status" aria-live="polite"></p>
        </form>
      </div>
    </section>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(root);
    const toggle = root.querySelector(".helper-agent-toggle");
    const panel = root.querySelector(".helper-agent-panel");
    const close = root.querySelector(".helper-agent-close");
    const form = root.querySelector(".helper-agent-form");
    const status = root.querySelector(".helper-agent-status");

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    }

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => setOpen(false));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "Sending...";
      const button = form.querySelector("button");
      button.disabled = true;

      const data = Object.fromEntries(new FormData(form).entries());
      const payload = {
        ...data,
        source: "website_helper",
        subject: data.category,
        pageUrl: window.location.href,
        metadata: {
          helperVersion: "20260708",
          referrer: document.referrer || ""
        }
      };

      try {
        const response = await fetch("/api/support-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.ok) throw new Error(result.error || "Could not send request");
        status.textContent = "Request sent. The team will follow up soon.";
        form.reset();
      } catch (error) {
        status.textContent = error.message || "Could not send request. Please use the inquiry form instead.";
      } finally {
        button.disabled = false;
      }
    });
  });
})();
