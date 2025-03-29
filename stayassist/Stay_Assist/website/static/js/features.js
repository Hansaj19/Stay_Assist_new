document.addEventListener("DOMContentLoaded", function () {
    // Initialize datetime inputs with default values (now + 1 hour)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const defaultDateTime = now.toISOString().slice(0, 16);
    document
      .querySelectorAll('input[type="datetime-local"]')
      .forEach((input) => {
        input.value = defaultDateTime;
      });

    // Handle form submissions
    document.querySelectorAll(".service-request-form").forEach((form) => {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitButton = this.querySelector(".btn-submit");
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {
          const serviceType = this.dataset.service;
          const formData = new FormData(this);

          // Validate required fields
          const issue = formData.get("issue");
          const date = formData.get("date");
          if (!issue || !date) {
            throw new Error("Please fill in all required fields");
          }

          // Create the request data
          const requestData = {
            service: serviceType,
            issue: issue,
            date: date,
          };

          // Add service-specific fields
          if (serviceType === "cleaning") {
            requestData.frequency = formData.get("frequency");
          } else if (serviceType === "pest") {
            requestData.pest_type = formData.get("pest_type");
          } else if (serviceType === "ac") {
            requestData.service_type = formData.get("service_type");
          } else if (serviceType === "furniture") {
            requestData.furniture_type = formData.get("furniture_type");
          }

          // Submit via AJAX
          const response = await fetch("/book-service", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Request failed");
          }

          const data = await response.json();

          if (data.success) {
            showSuccessModal();
            this.reset();
            this.querySelector('input[type="datetime-local"]').value =
              defaultDateTime;
            await loadServiceRequests(serviceType);
          } else {
            throw new Error(data.message || "Request failed");
          }
        } catch (error) {
          console.error("Error:", error);
          alert(`Error: ${error.message}`);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    });

    // Load existing requests for all services
    loadAllServiceRequests();

    // Modal control functions
    function showSuccessModal() {
      const modal = document.getElementById("success-modal");
      modal.style.display = "flex";

      setTimeout(() => {
        modal.style.display = "none";
      }, 3000);
    }

    document
      .querySelector(".close-modal")
      .addEventListener("click", function () {
        document.getElementById("success-modal").style.display = "none";
      });

    document
      .getElementById("modal-ok")
      .addEventListener("click", function () {
        document.getElementById("success-modal").style.display = "none";
      });

    //scroll funxtion
    function scrollToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }

    // Navbar buttons
    document.querySelector("a[href='#feedback']").addEventListener("click", function (e) {
        e.preventDefault();
        scrollToSection(".testimonials");
    });

    document.querySelector("a[href='#about']").addEventListener("click", function (e) {
        e.preventDefault();
        scrollToSection(".about-us");
    });

  });

  async function loadAllServiceRequests() {
    try {
      await Promise.all([
        loadServiceRequests("cleaning"),
        loadServiceRequests("pest"),
        loadServiceRequests("ac"),
        loadServiceRequests("furniture"),
      ]);
    } catch (error) {
      console.error("Error loading service requests:", error);
    }
  }

  async function loadServiceRequests(serviceType) {
    try {
      const response = await fetch(
        `/auth/service-requests?service=${serviceType}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const requests = await response.json();
      const container = document.getElementById(`${serviceType}-requests`);

      if (!container) return;

      container.innerHTML = "";

      if (!requests || requests.length === 0) {
        container.innerHTML = '<p class="no-requests">No requests yet</p>';
        return;
      }

      requests.forEach((request) => {
        const requestElement = document.createElement("div");
        requestElement.className = "request-item";

        let details = "";
        if (serviceType === "cleaning" && request.frequency) {
          details = `Frequency: ${request.frequency}`;
        } else if (serviceType === "pest" && request.pest_type) {
          details = `Pest Type: ${request.pest_type}`;
        } else if (serviceType === "ac" && request.service_type) {
          details = `Service Type: ${request.service_type}`;
        } else if (serviceType === "furniture" && request.furniture_type) {
          details = `Furniture: ${request.furniture_type}`;
        }

        requestElement.innerHTML = `
                    <p><strong>${
                      request.issue || "No description"
                    }</strong></p>
                    <p>Scheduled: ${
                      request.date
                        ? new Date(request.date).toLocaleString()
                        : "Not scheduled"
                    }</p>
                    ${details ? `<p>${details}</p>` : ""}
                    <p>Status: ${request.status || "Pending"}</p>
                    <hr>
                `;
        container.appendChild(requestElement);
      });
    } catch (error) {
      console.error(`Error loading ${serviceType} requests:`, error);
      const container = document.getElementById(`${serviceType}-requests`);
      if (container) {
        container.innerHTML =
          '<p class="error-message">Failed to load requests</p>';
      }
    }
  }
  document.querySelectorAll(".service-request-form").forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitButton = this.querySelector(".btn-submit");
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      try {
        const serviceType = this.dataset.service;
        const formData = new FormData(this);

        // Validate required fields
        if (!formData.get("issue") || !formData.get("date")) {
          throw new Error("Please fill in all required fields");
        }

        // Prepare request data
        const requestData = {
          service: serviceType,
          issue: formData.get("issue"),
          date: formData.get("date"),
        };

        // Add service-specific fields
        if (serviceType === "cleaning") {
          requestData.frequency = formData.get("frequency");
        } else if (serviceType === "pest") {
          requestData.pest_type = formData.get("pest_type");
        } else if (serviceType === "ac") {
          requestData.service_type = formData.get("service_type");
        } else if (serviceType === "furniture") {
          requestData.furniture_type = formData.get("furniture_type");
        }

        // Submit the request
        const response = await fetch("/book-service", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Request failed");
        }

        // Redirect to confirmation page
        window.location.href = data.redirect_url;
      } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  });