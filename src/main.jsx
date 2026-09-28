import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MyRoster from "./pages/MyRoster";
import Availability from "./pages/Availability";
import Leave from "./pages/Leave";
import ShiftSwap from "./pages/ShiftSwap";
import Approvals from "./pages/Approvals";
import Holidays from "./pages/Holidays";
import Policies from "./pages/Policies";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import EmployeeManagement from "./pages/EmployeeManagement";
import ShiftManagement from "./pages/ShiftManagement";
import Conflicts from "./pages/Conflicts";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import RosterManagement from "./pages/RosterManagement";

function App() {
  const [page, setPage] = React.useState(() => {
    const path = window.location.pathname;
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (path === "/login") {
      return "login";
    }

    // Admin Dashboard
    if (path === "/admin-dashboard") {
      if (token && role === "ADMIN") {
        return "admin-dashboard";
      }

      return "landing";
    }

    // Manager Dashboard
    if (path === "/manager-dashboard") {
      if (token && role === "MANAGER") {
        return "manager-dashboard";
      }

      return "landing";
    }

    // Employee Dashboard
    if (path === "/dashboard") {
      if (token && role === "EMPLOYEE") {
        return "dashboard";
      }

      return "landing";
    }

    // My Roster
    if (path === "/my-roster") {
      return "myRoster";
    }

    // Availability
    if (path === "/availability") {
      return "availability";
    }

    // Leave
    if (path === "/leave") {
      return "leave";
    }

    // Shift Swap
    if (path === "/shift-swap") {
      return "shiftSwap";
    }

    // Approvals
    if (path === "/approvals") {
      return "approvals";
    }

    // Holidays
    if (path === "/holidays") {
      return "holidays";
    }

    // Policies
    if (path === "/policies") {
      return "policies";
    }

    // Reports
    if (path === "/reports") {
      return "reports";
    }

    // AI Assistant
    if (path === "/ai-assistant") {
      return "aiAssistant";
    }

    // Employee Management
    if (path === "/employees") {
      return "employees";
    }

    // Shift Management
    if (path === "/shifts") {
      return "shifts";
    }

    // Conflict Detection
    if (path === "/conflicts") {
      return "conflicts";
    }

    // Profile
    if (path === "/profile") {
      return "profile";
    }

    // Roster Management
    if (path === "/roster") {
      return "roster";
    }

    return "landing";
  });

  const navigate = (nextPage, path) => {
    window.history.pushState({}, "", path);
    setPage(nextPage);
  };

  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (path === "/login") {
        setPage("login");
        return;
      }

      if (path === "/admin-dashboard") {
        setPage(token && role === "ADMIN"
            ? "admin-dashboard"
            : "landing");
        return;
      }

      if (path === "/manager-dashboard") {
        setPage(token && role === "MANAGER"
            ? "manager-dashboard"
            : "landing");
        return;
      }

      if (path === "/dashboard") {
        setPage(token && role === "EMPLOYEE"
            ? "dashboard"
            : "landing");
        return;
      }

      if (path === "/my-roster") {
        setPage("myRoster");
        return;
      }

      if (path === "/availability") {
        setPage("availability");
        return;
      }

      if (path === "/leave") {
        setPage("leave");
        return;
      }

      if (path === "/shift-swap") {
        setPage("shiftSwap");
        return;
      }

      if (path === "/approvals") {
        setPage("approvals");
        return;
      }

      if (path === "/holidays") {
        setPage("holidays");
        return;
      }

      if (path === "/policies") {
        setPage("policies");
        return;
      }

      if (path === "/reports") {
        setPage("reports");
        return;
      }

      if (path === "/ai-assistant") {
        setPage("aiAssistant");
        return;
      }

      if (path === "/employees") {
        setPage("employees");
        return;
      }

      if (path === "/shifts") {
        setPage("shifts");
        return;
      }

      if (path === "/conflicts") {
        setPage("conflicts");
        return;
      }

      if (path === "/profile") {
        setPage("profile");
        return;
      }

      if (path === "/roster") {
        setPage("roster");
        return;
      }

      setPage("landing");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Login page
  if (page === "login") {
    return (
        <Login
            onLogin={() => {
              const role = localStorage.getItem("role");

              if (role === "ADMIN") {
                window.history.pushState({}, "", "/admin-dashboard");
                setPage("admin-dashboard");
              } else if (role === "MANAGER") {
                window.history.pushState({}, "", "/manager-dashboard");
                setPage("manager-dashboard");
              } else {
                window.history.pushState({}, "", "/dashboard");
                setPage("dashboard");
              }
            }}
        />
    );
  }

  // Employee Dashboard
  if (page === "dashboard") {
    return <Dashboard />;
  }

  // My Roster
  if (page === "myRoster") {
    return <MyRoster />;
  }

  // Availability
  if (page === "availability") {
    return <Availability />;
  }

  // Leave
  if (page === "leave") {
    return <Leave />;
  }

  // Shift Swap
  if (page === "shiftSwap") {
    return <ShiftSwap />;
  }

  // Approvals
  if (page === "approvals") {
    return <Approvals />;
  }

  // Holidays
  if (page === "holidays") {
    return <Holidays />;
  }

  // Policies
  if (page === "policies") {
    return <Policies />;
  }

  // Reports
  if (page === "reports") {
    return <Reports />;
  }

  // AI Assistant
  if (page === "aiAssistant") {
    return <AIAssistant />;
  }

  // Employee Management
  if (page === "employees") {
    return <EmployeeManagement />;
  }

  // Shift Management
  if (page === "shifts") {
    return <ShiftManagement />;
  }

  // Conflicts
  if (page === "conflicts") {
    return <Conflicts />;
  }

  // Profile
  if (page === "profile") {
    return <Profile />;
  }

  // Admin Dashboard
  if (page === "admin-dashboard") {
    return <AdminDashboard />;
  }

  // Manager Dashboard
  if (page === "manager-dashboard") {
    return <ManagerDashboard />;
  }

  // Roster Management
  if (page === "roster") {
    return <RosterManagement />;
  }

  // Landing Page
  return (
      <div className="landing-page">

        {/* Navigation */}
        <nav className="navbar">

          <div className="logo">

            <div className="logo-icon">
              W
            </div>

            <div>
              <div className="logo-title">
                WorkforceIQ
              </div>

              <div className="logo-subtitle">
                SMART WORKFORCE
              </div>
            </div>

          </div>

          <div className="nav-links">

            <a href="#features">
              Features
            </a>

            <a href="#modules">
              Modules
            </a>

            <a href="#about">
              About
            </a>

            <button
                className="nav-login"
                onClick={() => navigate("login", "/login")}
            >
              Login
            </button>

            <button
                className="nav-login"
                onClick={() => navigate("aiAssistant", "/ai-assistant")}
            >
              AI Assistant
            </button>

          </div>

        </nav>

        {/* Hero */}
        <main>

          <section className="hero">

            <div className="hero-content">

              <div className="hero-badge">
                ● INTELLIGENT WORKFORCE MANAGEMENT
              </div>

              <h1>
                Schedule smarter.
                <br />
                <span>Work better.</span>
              </h1>

              <p className="hero-description">
                WorkforceIQ helps organizations manage employees,
                shifts, availability, leave and intelligent rosters
                from one powerful workforce scheduling platform.
              </p>

              <div className="hero-buttons">

                <button
                    className="primary-button"
                    onClick={() => navigate("login", "/login")}
                >
                  Get Started
                  <span>→</span>
                </button>

                <button
                    className="secondary-button"
                    onClick={() =>
                        document
                            .getElementById("features")
                            ?.scrollIntoView({
                              behavior: "smooth"
                            })
                    }
                >
                  Explore Features
                </button>

              </div>

              <div className="trust-row">

                <div>
                  <strong>12+</strong>
                  <span>Workforce Modules</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>Roster Visibility</span>
                </div>

                <div>
                  <strong>AI</strong>
                  <span>Staffing Insights</span>
                </div>

              </div>

            </div>

            {/* Dashboard Preview */}
            <div className="hero-visual">

              <div className="dashboard-window">

                <div className="window-header">

                  <div className="window-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="window-title">
                    Workforce Dashboard
                  </div>

                </div>

                <div className="dashboard-body">

                  <div className="mini-sidebar">

                    <div className="mini-logo">
                      W
                    </div>

                    <div className="mini-active">
                      ⌂
                    </div>

                    <div>
                      ◫
                    </div>

                    <div>
                      ◷
                    </div>

                    <div>
                      ♙
                    </div>

                    <div>
                      ⚙
                    </div>

                  </div>

                  <div className="mini-content">

                    <div className="mini-heading">

                      <div>

                        <small>
                          MONDAY, NOVEMBER 16
                        </small>

                        <h3>
                          Good morning, Manager
                        </h3>

                      </div>

                      <div className="avatar">
                        M
                      </div>

                    </div>

                    <div className="stats">

                      <div className="stat-card">

                      <span>
                        Employees
                      </span>

                        <strong>
                          128
                        </strong>

                        <small>
                          Active workforce
                        </small>

                      </div>

                      <div className="stat-card">

                      <span>
                        Today's Shifts
                      </span>

                        <strong>
                          42
                        </strong>

                        <small>
                          Scheduled today
                        </small>

                      </div>

                      <div className="stat-card">

                      <span>
                        Coverage
                      </span>

                        <strong>
                          96%
                        </strong>

                        <small>
                          Shift coverage
                        </small>

                      </div>

                    </div>

                    <div className="roster-preview">

                      <div className="roster-title">

                        <strong>
                          Today's Roster
                        </strong>

                        <span>
                        View all →
                      </span>

                      </div>

                      <div className="roster-row">

                        <div className="person">

                          <div className="person-avatar">
                            PS
                          </div>

                          <div>

                            <strong>
                              Priya Sharma
                            </strong>

                            <small>
                              EMP002
                            </small>

                          </div>

                        </div>

                        <span className="shift morning">
                        Morning
                      </span>

                        <span className="status">
                        Assigned
                      </span>

                      </div>

                      <div className="roster-row">

                        <div className="person">

                          <div className="person-avatar">
                            DS
                          </div>

                          <div>

                            <strong>
                              Divya S
                            </strong>

                            <small>
                              EMP004
                            </small>

                          </div>

                        </div>

                        <span className="shift afternoon">
                        Afternoon
                      </span>

                        <span className="status">
                        Assigned
                      </span>

                      </div>

                      <div className="roster-row">

                        <div className="person">

                          <div className="person-avatar">
                            RK
                          </div>

                          <div>

                            <strong>
                              Ravi Kumar
                            </strong>

                            <small>
                              EMP003
                            </small>

                          </div>

                        </div>

                        <span className="shift night">
                        Night
                      </span>

                        <span className="status">
                        Assigned
                      </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* Features */}
          <section
              id="features"
              className="features-section"
          >

            <div className="section-heading">

            <span>
              POWERFUL FEATURES
            </span>

              <h2>
                Everything your workforce needs
              </h2>

              <p>
                A complete platform for planning, scheduling,
                monitoring and optimizing your workforce.
              </p>

            </div>

            <div className="feature-grid">

              <Feature
                  icon="👥"
                  title="Employee Management"
                  text="Manage employees, departments, designations and workforce information."
              />

              <Feature
                  icon="🕐"
                  title="Smart Scheduling"
                  text="Generate rosters while respecting business rules and workforce constraints."
              />

              <Feature
                  icon="📅"
                  title="Availability & Leave"
                  text="Track employee availability, leave requests and holiday calendars."
              />

              <Feature
                  icon="⚡"
                  title="Conflict Detection"
                  text="Identify scheduling conflicts before they impact operations."
              />

              <Feature
                  icon="🔄"
                  title="Shift Swaps"
                  text="Allow employees to request and manage shift swaps."
              />

              <Feature
                  icon="🤖"
                  title="AI Insights"
                  text="Get explanations, staffing insights and intelligent workforce information."
              />

            </div>

          </section>

          {/* Modules */}
          <section
              id="modules"
              className="modules-section"
          >

            <div className="section-heading">

            <span>
              COMPLETE WORKFORCE PLATFORM
            </span>

              <h2>
                One platform. Twelve capabilities.
              </h2>

            </div>

            <div className="module-grid">

              {[
                "Login + JWT",
                "Employee Management",
                "Shift Management",
                "Employee Availability",
                "Leave Management",
                "Holiday Calendar",
                "Business Rules",
                "Smart Roster Generator",
                "Conflict Detection",
                "Manager Approval",
                "Employee Roster",
                "Shift Swap"
              ].map((module, index) => (

                  <div
                      className="module-card"
                      key={module}
                  >

                    <div className="module-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <strong>
                      {module}
                    </strong>

                    <span>
                  →
                </span>

                  </div>

              ))}

            </div>

          </section>

          {/* CTA */}
          <section
              id="about"
              className="cta-section"
          >

            <div>

            <span>
              WORKFORCE INTELLIGENCE
            </span>

              <h2>
                Build better schedules.
                <br />
                Empower your people.
              </h2>

              <p>
                WorkforceIQ connects your workforce data,
                scheduling rules and intelligent insights in
                one unified platform.
              </p>

              <button
                  className="primary-button"
                  onClick={() => navigate("login", "/login")}
              >
                Enter WorkforceIQ →
              </button>

            </div>

          </section>

        </main>

        {/* Footer */}
        <footer>

          <div className="footer-logo">

            <div className="logo-icon">
              W
            </div>

            <strong>
              WorkforceIQ
            </strong>

          </div>

          <p>
            Smart Workforce Scheduling System
          </p>

          <span>
          React • Spring Boot • MySQL • Spring Security • JWT • AI
        </span>

        </footer>

      </div>
  );
}

function Feature({ icon, title, text }) {
  return (
      <div className="feature-card">

        <div className="feature-icon">
          {icon}
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

        <span className="feature-arrow">
        →
      </span>

      </div>
  );
}

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);
