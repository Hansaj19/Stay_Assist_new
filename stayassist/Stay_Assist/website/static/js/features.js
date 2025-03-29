// document.addEventListener("DOMContentLoaded", function () {
//     // Select all service cards
//     const serviceCards = document.querySelectorAll(".service-card");
//     const container = document.querySelector(".container");

//     // Create the form dynamically
//     const formContainer = document.createElement("div");
//     formContainer.classList.add("service-form-container");
//     formContainer.innerHTML = `
//         <div class="service-form">
//             <h2 id="service-title">Book Service</h2>
//             <label for="issue">Describe the Issue:</label>
//             <textarea id="issue" placeholder="Enter your issue here..." required></textarea>

//             <div id="upload-container">
//                 <label for="upload">Upload an Image (if required):</label>
//                 <input type="file" id="upload" accept="image/*">
//             </div>

//             <label for="time-slot">Select a Date & Time:</label>
//             <input type="datetime-local" id="time-slot" required>

//             <button id="submit-btn">Submit</button>
//             <button id="close-btn">Close</button>
//         </div>
//     `;

//     // Append the form container to the main container
//     container.appendChild(formContainer);

//     // Hide the form initially
//     formContainer.style.display = "none";

//     // Event listener for clicking service cards
//     serviceCards.forEach((card) => {
//         card.addEventListener("click", function () {
//             const serviceName = card.querySelector("img").alt; // Get service name from alt text
//             document.getElementById("service-title").innerText = `Book ${serviceName}`;

//             // Hide image upload for Cleaning service
//             const uploadContainer = document.getElementById("upload-container");
//             if (serviceName.toLowerCase().includes("cleaning")) {
//                 uploadContainer.style.display = "none";
//             } else {
//                 uploadContainer.style.display = "block";
//             }

//             formContainer.style.display = "flex"; // Show form
//         });
//     });

//     // Close button functionality
//     document.getElementById("close-btn").addEventListener("click", function () {
//         formContainer.style.display = "none";
//     });
// });


//new merged code for both seaparate one starts here..................................

// document.addEventListener("DOMContentLoaded", function () {
//     // Initialize datetime inputs with default values (now + 1 hour)
//     const now = new Date();
//     now.setHours(now.getHours() + 1);
//     const defaultDateTime = now.toISOString().slice(0, 16);
//     document.querySelectorAll('input[type="datetime-local"]').forEach(input => {
//         input.value = defaultDateTime;
//     });

//     // Handle form submissions
//     document.querySelectorAll(".service-request-form").forEach(form => {
//         form.addEventListener("submit", async function (e) {
//             e.preventDefault();
//             const submitButton = this.querySelector(".btn-submit");
//             const originalButtonText = submitButton.textContent;
//             submitButton.disabled = true;
//             submitButton.textContent = "Submitting...";

//             try {
//                 const serviceType = this.dataset.service;
//                 const formData = new FormData(this);

//                 if (!formData.get("issue") || !formData.get("date")) {
//                     throw new Error("Please fill in all required fields");
//                 }

//                 const requestData = {
//                     service: serviceType,
//                     issue: formData.get("issue"),
//                     date: formData.get("date"),
//                 };

//                 if (serviceType === "cleaning") {
//                     requestData.frequency = formData.get("frequency");
//                 } else if (serviceType === "pest") {
//                     requestData.pest_type = formData.get("pest_type");
//                 } else if (serviceType === "ac") {
//                     requestData.service_type = formData.get("service_type");
//                 } else if (serviceType === "furniture") {
//                     requestData.furniture_type = formData.get("furniture_type");
//                 }

//                 const response = await fetch("/book-service", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(requestData),
//                 });

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw new Error(data.error || "Request failed");
//                 }

//                 showSuccessModal();
//                 this.reset();
//                 this.querySelector('input[type="datetime-local"]').value = defaultDateTime;
//                 await loadServiceRequests(serviceType);
//             } catch (error) {
//                 console.error("Error:", error);
//                 alert(`Error: ${error.message}`);
//             } finally {
//                 submitButton.disabled = false;
//                 submitButton.textContent = originalButtonText;
//             }
//         });
//     });

//     function showSuccessModal() {
//         const modal = document.getElementById("success-modal");
//         modal.style.display = "flex";
//         setTimeout(() => {
//             modal.style.display = "none";
//         }, 3000);
//     }

//     document.querySelector(".close-modal").addEventListener("click", () => {
//         document.getElementById("success-modal").style.display = "none";
//     });

//     document.getElementById("modal-ok").addEventListener("click", () => {
//         document.getElementById("success-modal").style.display = "none";
//     });

//     async function loadAllServiceRequests() {
//         try {
//             await Promise.all([
//                 loadServiceRequests("cleaning"),
//                 loadServiceRequests("pest"),
//                 loadServiceRequests("ac"),
//                 loadServiceRequests("furniture"),
//             ]);
//         } catch (error) {
//             console.error("Error loading service requests:", error);
//         }
//     }

//     async function loadServiceRequests(serviceType) {
//         try {
//             const response = await fetch(`/auth/service-requests?service=${serviceType}`);
//             if (!response.ok) throw new Error("Failed to fetch requests");
//             const requests = await response.json();
//             const container = document.getElementById(`${serviceType}-requests`);
//             if (!container) return;

//             container.innerHTML = requests.length === 0 
//                 ? '<p class="no-requests">No requests yet</p>' 
//                 : requests.map(request => `
//                     <div class="request-item">
//                         <p><strong>${request.issue || "No description"}</strong></p>
//                         <p>Scheduled: ${request.date ? new Date(request.date).toLocaleString() : "Not scheduled"}</p>
//                         ${request.details ? `<p>${request.details}</p>` : ""}
//                         <p>Status: ${request.status || "Pending"}</p>
//                         <hr>
//                     </div>
//                 `).join('');
//         } catch (error) {
//             console.error(`Error loading ${serviceType} requests:`, error);
//             document.getElementById(`${serviceType}-requests`).innerHTML = '<p class="error-message">Failed to load requests</p>';
//         }
//     }

//     // Service Card Form Handling
//     const serviceCards = document.querySelectorAll(".service-card");
//     const container = document.querySelector(".container");

//     const formContainer = document.createElement("div");
//     formContainer.classList.add("service-form-container");
//     formContainer.innerHTML = `
//         <div class="service-form">
//             <h2 id="service-title">Book Service</h2>
//             <label for="issue">Describe the Issue:</label>
//             <textarea id="issue" placeholder="Enter your issue here..." required></textarea>
//             <div id="upload-container">
//                 <label for="upload">Upload an Image (if required):</label>
//                 <input type="file" id="upload" accept="image/*">
//             </div>
//             <label for="time-slot">Select a Date & Time:</label>
//             <input type="datetime-local" id="time-slot" required>
//             <button id="submit-btn">Submit</button>
//             <button id="close-btn">Close</button>
//         </div>
//     `;
//     container.appendChild(formContainer);
//     formContainer.style.display = "none";

//     serviceCards.forEach(card => {
//         card.addEventListener("click", function () {
//             const serviceName = card.querySelector("img").alt;
//             document.getElementById("service-title").innerText = `Book ${serviceName}`;
//             document.getElementById("upload-container").style.display = serviceName.toLowerCase().includes("cleaning") ? "none" : "block";
//             formContainer.style.display = "flex";
//         });
//     });

//     document.getElementById("close-btn").addEventListener("click", function () {
//         formContainer.style.display = "none";
//     });

//     loadAllServiceRequests();
// });



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
        scrollToSection(".whats-next");
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