// Welcome animation
setTimeout(() => {
  const welcomeAnimation = document.getElementById('welcome-animation');
  if (welcomeAnimation) {
    welcomeAnimation.style.display = 'none';
  }
}, 3000); // Hide after 3 seconds

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-links a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    navLinks.classList.remove('active'); // Close mobile menu after click
  });
});

// Fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Contact Form
const contactForm = document.getElementById("contact-form");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Thank you! Your message has been sent successfully.");
      contactForm.reset();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert("Something went wrong. Please try again later.");
  }
});

// Load Submissions
const loadSubmissionsBtn = document.getElementById("load-submissions");
const submissionsList = document.getElementById("submissions-list");

loadSubmissionsBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/submissions");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const submissions = await res.json();
    submissionsList.innerHTML = "";
    if (submissions.length === 0) {
      submissionsList.innerHTML = "<p>No submissions yet.</p>";
    } else {
      submissions.forEach(sub => {
        const div = document.createElement("div");
        div.className = "submission-item";
        div.innerHTML = `
          <input type="checkbox" class="select-contact" data-id="${sub.id}" />
          <h3>${sub.name}</h3>
          <p><strong>Email:</strong> ${sub.email}</p>
          <p><strong>Message:</strong> ${sub.message}</p>
          <p><strong>Date:</strong> ${new Date(sub.date).toLocaleString()}</p>
        `;
        submissionsList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading submissions:', error);
    alert("Load submissions error: Something went wrong. Please try again later.");
  }
});

// Delete Selected
const deleteSelectedBtn = document.getElementById("delete-selected");
deleteSelectedBtn.addEventListener("click", async () => {
  const selectedCheckboxes = document.querySelectorAll(".select-contact:checked");
  if (selectedCheckboxes.length === 0) {
    alert("Please select at least one submission to delete.");
    return;
  }

  if (!confirm(`Are you sure you want to delete ${selectedCheckboxes.length} submission(s)?`)) {
    return;
  }

  try {
    const idsToDelete = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute("data-id"));
    const res = await fetch("http://localhost:5000/api/submissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsToDelete }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Selected submissions deleted successfully.");
      loadSubmissionsBtn.click(); // Reload the list
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error('Error deleting submissions:', error);
    alert("Something went wrong. Please try again later.");
  }
});

// Service Dropdown and Modal
const serviceDropdown = document.getElementById("service-dropdown");
const modal = document.getElementById("service-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalFeatures = document.getElementById("modal-features");
const closeBtn = document.querySelector(".close");

const servicesData = {
  "ai-diagnostics": {
    title: "AI Diagnostics",
    description: "Leverage advanced AI algorithms to predict vehicle issues before they occur, ensuring optimal performance and safety.",
    features: [
      "Real-time health monitoring",
      "Predictive maintenance alerts",
      "Data-driven insights for repairs",
      "Integration with existing systems"
    ]
  },
  "iot-monitoring": {
    title: "IoT Monitoring",
    description: "Connect vehicles to the cloud with seamless IoT integration for continuous data streaming and remote management.",
    features: [
      "Real-time data collection",
      "Remote diagnostics",
      "Fleet-wide monitoring",
      "Secure data transmission"
    ]
  },
  "ev-fleet": {
    title: "EV Fleet Management",
    description: "Optimize electric vehicle fleets with intelligent charging, routing, and analytics for cost-effective operations.",
    features: [
      "Smart charging schedules",
      "Route optimization",
      "Battery health tracking",
      "Cost analysis and reporting"
    ]
  },
  "autonomous-driving": {
    title: "Autonomous Driving",
    description: "Develop and deploy autonomous driving technologies for safer, more efficient transportation solutions.",
    features: [
      "Advanced sensor integration",
      "Machine learning algorithms",
      "Safety-first design",
      "Regulatory compliance support"
    ]
  },
  "smart-charging": {
    title: "Smart Charging",
    description: "Implement intelligent charging infrastructure for EVs, balancing grid load and user convenience.",
    features: [
      "Load balancing",
      "Demand response",
      "User-friendly scheduling",
      "Energy cost optimization"
    ]
  }
};

serviceDropdown.addEventListener("change", (e) => {
  const selectedService = e.target.value;
  if (selectedService && servicesData[selectedService]) {
    const service = servicesData[selectedService];
    modalTitle.textContent = service.title;
    modalDescription.textContent = service.description;
    modalFeatures.innerHTML = service.features.map(feature => `<li>${feature}</li>`).join("");
    modal.style.display = "block";
  }
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Purchase Service
const purchaseService = document.getElementById("purchase-service");
const purchaseBtn = document.getElementById("purchase-btn");

purchaseService.addEventListener("change", () => {
  purchaseBtn.disabled = !purchaseService.value;
});

purchaseBtn.addEventListener("click", async () => {
  const selectedOption = purchaseService.options[purchaseService.selectedIndex];
  const service = selectedOption.value;
  const price = selectedOption.getAttribute("data-price");

  if (!service || !price) return;

  try {
    const res = await fetch("http://localhost:5000/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, price }),
    });

    const { clientSecret } = await res.json();

    // Load Stripe.js
    const stripe = Stripe("pk_test_51Qexample..."); // Replace with your publishable key
    const elements = stripe.elements();
    const cardElement = elements.create("card");
    cardElement.mount("#card-element");
    document.getElementById("card-element").style.display = "block";

    // Handle payment
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      alert("Payment failed: " + error.message);
    } else {
      alert("Payment successful! Service purchased.");
      purchaseService.value = "";
      purchaseBtn.disabled = true;
      document.getElementById("card-element").style.display = "none";
    }
  } catch (error) {
    console.error("Payment error:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Search Functionality
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const cards = document.querySelectorAll(".service-card");
  cards.forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const desc = card.querySelector("p").textContent.toLowerCase();
    if (title.includes(query) || desc.includes(query)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Chatbot Functionality
const chatbot = document.getElementById("chatbot");
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");

chatbotToggle.addEventListener("click", () => {
  chatbot.style.display = chatbot.style.display === "flex" ? "none" : "flex";
});

chatbotClose.addEventListener("click", () => {
  chatbot.style.display = "none";
});

chatbotSend.addEventListener("click", () => {
  const message = chatbotInput.value.trim();
  if (message) {
    addMessage("user", message);
    chatbotInput.value = "";
    respondToMessage(message);
  }
});

chatbotInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    chatbotSend.click();
  }
});

function addMessage(sender, text) {
  const message = document.createElement("div");
  message.className = `chatbot-message ${sender}`;
  message.textContent = text;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function respondToMessage(message) {
  const responses = {
    "hello": "Hi! How can I help you with AutoNext services?",
    "services": "We offer Smart Vehicle Analytics, IoT-Based Monitoring, and EV Fleet Management. Which one interests you?",
    "contact": "You can contact us via the form on the website or email us directly.",
    "pricing": "Our services start from ₹3000. Check the purchase section for details.",
    "default": "I'm here to help! Ask about our services, pricing, or contact info."
  };

  const lowerMessage = message.toLowerCase();
  let response = responses.default;
  for (const key in responses) {
    if (lowerMessage.includes(key)) {
      response = responses[key];
      break;
    }
  }

  setTimeout(() => addMessage("bot", response), 500);
}

// Enhanced Animations
const enhancedObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.model-card').forEach(card => enhancedObserver.observe(card));
