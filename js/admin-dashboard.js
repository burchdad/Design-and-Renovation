(function () {
  const loginPanel = document.getElementById("loginPanel");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const loginForm = document.getElementById("adminLoginForm");
  const ticketForm = document.getElementById("adminTicketForm");
  const loginMessage = document.getElementById("loginMessage");
  const ticketMessageStatus = document.getElementById("ticketMessageStatus");
  const logoutButton = document.getElementById("logoutButton");
  const refreshStatusButton = document.getElementById("refreshStatusButton");

  function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = "block";
    element.setAttribute("role", "status");
    element.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  }

  function setDashboardVisible(visible) {
    loginPanel.hidden = visible;
    dashboardPanel.hidden = !visible;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  async function refreshStatus() {
    const response = await fetch("/api/admin-session", { credentials: "include" });
    const data = await response.json();

    setDashboardVisible(Boolean(data.authenticated));
    setText("sessionStatus", data.authenticated ? "Active" : "Locked");
    setText("endpointStatus", data.authenticated ? "Available" : "Locked");
    setText("authStatus", data.authenticated ? "Active" : "Locked");
    return data;
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.style.display = "none";
    const button = loginForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Checking...";

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: loginForm.password.value })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("Unable to sign in with those credentials.");
      loginForm.reset();
      await refreshStatus();
    } catch (error) {
      showMessage(loginMessage, "Unable to sign in with those credentials.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Sign In";
    }
  });

  ticketForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    ticketMessageStatus.style.display = "none";
    const button = ticketForm.querySelector("button");
    button.disabled = true;
    button.textContent = "Sending...";

    const payload = {
      source: "admin",
      category: ticketForm.category.value,
      priority: ticketForm.priority.value,
      subject: ticketForm.subject.value,
      message: ticketForm.message.value,
      pageUrl: window.location.href,
      metadata: { submittedFrom: "owner_login" }
    };

    try {
      const response = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error("Unable to send that request right now.");
      showMessage(ticketMessageStatus, `Request ${data.ticketId} was received.`, "success");
      ticketForm.reset();
    } catch (error) {
      showMessage(ticketMessageStatus, "Unable to send that request right now.", "error");
    } finally {
      button.disabled = false;
      button.textContent = "Send Request";
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await fetch("/api/admin-session", { method: "POST", credentials: "include" });
    setDashboardVisible(false);
  });

  refreshStatusButton?.addEventListener("click", refreshStatus);
  refreshStatus().catch(() => setDashboardVisible(false));
})();
