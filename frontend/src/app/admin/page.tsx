"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { getProperties, type Property } from "@/lib/propertyApi";

const nationalityCodes = "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

interface UpcomingProject {
  id: number;
  title: string;
  description: string | null;
  type: string;
  location: string;
  city: string;
  launchPrice: string;
  handover: string;
  image: string;
  createdAt: string;
}

interface PortalUser {
  id: number;
  username: string;
  email: string;
  role: string;
  mfaType: string;
  otpSecret: string | null;
  createdAt: string;
}

interface Booking { id: number; propertyName: string; name: string; email: string; phone: string; nationality: string; passportPath: string | null; status: string; declineReason: string | null; createdAt: string; }
interface NationalityRule { id: number; nationality: string; isActive: boolean; }

export default function AdminDashboard() {
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<string>("Viewer");
  const [userUsername, setUserUsername] = useState<string>("");

  // Login inputs
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // OTP inputs
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpMfaType, setOtpMfaType] = useState<"Email OTP" | "Google Authenticator">("Email OTP");
  const [otpEmailSentTo, setOtpEmailSentTo] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpMockCode, setOtpMockCode] = useState(""); // For local testing ease!
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Active dashboard tab state
  const [activeTab, setActiveTab] = useState<"welcome" | "listings" | "upcoming" | "add-property" | "sync" | "users" | "bookings" | "nationality-rules">("welcome");

  // Listings states
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  
  // Upcoming projects states
  const [upcomingProjects, setUpcomingProjects] = useState<UpcomingProject[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  // Users management states
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [nationalityRules, setNationalityRules] = useState<NationalityRule[]>([]);
  const [nationalityInput, setNationalityInput] = useState("");
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [savingNationalityRule, setSavingNationalityRule] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalSecret, setQrModalSecret] = useState("");
  const [qrModalUsername, setQrModalUsername] = useState("");
  
  // New listing (property) form states
  const [listingForm, setListingForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    type: "Residential",
    purpose: "Rent", // Rent first since we mostly give on rent!
    status: "Ready",
    beds: "1",
    baths: "1",
    area: "",
  });
  const [listingImages, setListingImages] = useState<FileList | null>(null);
  const [savingListing, setSavingListing] = useState(false);

  // New upcoming project form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    type: "Apartments",
    location: "",
    city: "Dubai",
    launchPrice: "",
    handover: "",
  });
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [savingProject, setSavingProject] = useState(false);

  // New User form states
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "Editor", // Default to editor
    mfaType: "Email OTP",
  });
  const [savingUser, setSavingUser] = useState(false);

  // General messages
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Check auth cookie on mount
  const checkAuth = async () => {
    try {
      setCheckingAuth(true);
      const res = await fetch("/api/admin/check-auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUserRole(data.role || "Viewer");
        setUserUsername(data.username || "");
      } else {
        setIsAuthenticated(false);
        setUserRole("Viewer");
        setUserUsername("");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch listings, upcoming projects, and portal users
  const fetchProperties = async () => {
    try {
      setLoadingListings(true);
      const { properties: data } = await getProperties({ pageSize: 10 });
      setProperties(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load listings.");
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchUpcomingProjects = async () => {
    try {
      setLoadingUpcoming(true);
      const res = await fetch("/api/upcoming-projects");
      if (!res.ok) throw new Error("Failed to fetch upcoming projects");
      const data = await res.json();
      setUpcomingProjects(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load upcoming projects.");
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const fetchPortalUsers = async () => {
    if (userRole !== "Super Admin") return;
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setPortalUsers(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load portal users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBookings = async () => { if (userRole !== "Super Admin") return; const res = await fetch("/api/admin/bookings", { cache: "no-store" }); if (res.ok) setBookings(await res.json()); };
  const fetchNationalityRules = async () => { if (userRole !== "Super Admin") return; const res = await fetch("/api/admin/nationality-rejections"); if (res.ok) setNationalityRules(await res.json()); };
  const saveNationalityRule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nationalityInput.trim()) return;
    setSavingNationalityRule(true);
    const res = await fetch("/api/admin/nationality-rejections", { method: editingRuleId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingRuleId ? { id: editingRuleId, nationality: nationalityInput.trim() } : { nationality: nationalityInput.trim() }) });
    const data = await res.json();
    setSavingNationalityRule(false);
    if (!res.ok) return setErrorMessage(data.error || "Unable to save nationality rule.");
    setNationalityInput(""); setEditingRuleId(null); setStatusMessage("Nationality auto-rejection rule saved."); fetchNationalityRules();
  };
  const updateNationalityRule = async (id: number, data: Record<string, unknown>) => { const res = await fetch("/api/admin/nationality-rejections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) }); if (res.ok) fetchNationalityRules(); else setErrorMessage((await res.json()).error || "Unable to update rule."); };
  const removeNationalityRule = async (id: number) => { if (!window.confirm("Remove this nationality auto-rejection rule?")) return; const res = await fetch(`/api/admin/nationality-rejections?id=${id}`, { method: "DELETE" }); if (res.ok) { setStatusMessage("Nationality rule removed."); fetchNationalityRules(); } else setErrorMessage((await res.json()).error || "Unable to remove rule."); };
  const updateBookingStatus = async (id: number, status: "Confirmed" | "Declined") => { const reason = status === "Declined" ? window.prompt("Please enter the reason for declining this booking. This will be emailed to the customer:") : undefined; if (status === "Declined" && !reason?.trim()) return; const res = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, reason }) }); if (res.ok) { if (selectedBooking?.id === id) setSelectedBooking(null); fetchBookings(); } else setErrorMessage((await res.json()).error || "Unable to update booking."); };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      fetchUpcomingProjects();
      if (userRole === "Super Admin") {
        fetchPortalUsers();
        fetchBookings();
        fetchNationalityRules();
      }
    }
  }, [isAuthenticated, userRole]);

  // Keep live booking requests visible without requiring the administrator to refresh.
  useEffect(() => {
    if (!isAuthenticated || userRole !== "Super Admin" || activeTab !== "bookings") return;
    fetchBookings();
    const interval = window.setInterval(fetchBookings, 8000);
    const refreshOnFocus = () => fetchBookings();
    window.addEventListener("focus", refreshOnFocus);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", refreshOnFocus); };
  }, [isAuthenticated, userRole, activeTab]);

  // Handle Password submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.requireOtp) {
        setOtpRequired(true);
        setOtpMfaType(data.mfaType);
        setOtpEmailSentTo(data.email || "");
        setOtpMockCode(data.mockCode || ""); // Seed local mock testing helper!
        setLoginError("");
      } else {
        setLoginError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setLoginError("Login server error. Try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setOtpVerifying(true);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, code: otpInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setUserRole(data.role);
        setUserUsername(data.username);
        
        // Reset states
        setUsernameInput("");
        setPasswordInput("");
        setOtpInput("");
        setOtpRequired(false);
      } else {
        setLoginError(data.error || "Invalid or expired OTP code.");
      }
    } catch (err) {
      setLoginError("OTP verification error. Try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setUserRole("Viewer");
      setUserUsername("");
      setActiveTab("welcome");
      setStatusMessage("");
      setErrorMessage("");
      setOtpRequired(false);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Sync properties from ERP
  const handleSyncErp = async () => {
    if (userRole === "Editor" || userRole === "Viewer") return;
    try {
      setSyncing(true);
      setStatusMessage("Syncing with ERP system...");
      setErrorMessage("");
      
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "mock-api-key" }),
      });

      if (!res.ok) throw new Error("Sync request failed.");
      
      const data = await res.json();
      if (data.success) {
        setStatusMessage(
          `ERP Sync complete! Inserted: ${data.results.inserted}, Updated: ${data.results.updated}. Preserved manual pictures.`
        );
        fetchProperties();
      } else {
        throw new Error(data.error || "Failed to sync.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to complete ERP sync.");
      setStatusMessage("");
    } finally {
      setSyncing(false);
    }
  };

  // Properties are read-only here because the backend manages them from ERP.
  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("Properties are managed by the ERP backend. Use ERP Sync to refresh frontend listings.");
  };

  // Handle manual upcoming project submit
  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    if (userRole === "Editor" || userRole === "Viewer") return;
    e.preventDefault();
    setSavingProject(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("title", projectForm.title);
      formData.append("description", projectForm.description);
      formData.append("type", projectForm.type);
      formData.append("location", projectForm.location);
      formData.append("city", projectForm.city);
      formData.append("launchPrice", projectForm.launchPrice);
      formData.append("handover", projectForm.handover);
      if (projectFile) {
        formData.append("image", projectFile);
      }

      const res = await fetch("/api/upcoming-projects", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add project.");
      
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Upcoming project added successfully!");
        setProjectForm({
          title: "",
          description: "",
          type: "Apartments",
          location: "",
          city: "Dubai",
          launchPrice: "",
          handover: "",
        });
        setProjectFile(null);
        fetchUpcomingProjects();
        setActiveTab("upcoming");
      } else {
        throw new Error(data.error || "Failed to save project.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add upcoming project.");
    } finally {
      setSavingProject(false);
    }
  };

  // Delete upcoming project
  const handleDeleteProject = async (id: number) => {
    if (userRole === "Editor" || userRole === "Viewer") return;
    if (!confirm("Are you sure you want to delete this upcoming project?")) return;

    try {
      const res = await fetch(`/api/upcoming-projects?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete project.");

      setStatusMessage("Upcoming project deleted successfully.");
      setUpcomingProjects(upcomingProjects.filter((p) => p.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete project.");
    }
  };

  // Create new user submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    if (userRole !== "Super Admin") return;
    e.preventDefault();
    setSavingUser(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`User "${userForm.username}" added successfully!`);
        setUserForm({
          username: "",
          password: "",
          email: "",
          role: "Editor",
          mfaType: "Email OTP",
        });
        fetchPortalUsers();
        
        // Show QR registration setup dialog immediately if Google Authenticator was selected!
        if (data.user.otpSecret) {
          openQrModal(data.user.username, data.user.otpSecret);
        }
      } else {
        throw new Error(data.error || "Failed to create user.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create user.");
    } finally {
      setSavingUser(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id: number, targetUsername: string) => {
    if (userRole !== "Super Admin") return;
    if (targetUsername === userUsername) {
      alert("You cannot delete your own logged-in user profile.");
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${targetUsername}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user.");

      setStatusMessage(`User "${targetUsername}" deleted successfully.`);
      setPortalUsers(portalUsers.filter((u) => u.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete user.");
    }
  };

  const openQrModal = (username: string, secret: string) => {
    setQrModalUsername(username);
    setQrModalSecret(secret);
    setShowQrModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Liveness Check screen
  if (checkingAuth) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard} style={{ padding: "60px 40px" }}>
          <h2 style={{ color: "#0f4c81" }}>Checking System Auth...</h2>
          <p style={{ marginTop: "12px", marginBottom: 0 }}>Verifying secure administrative cookie session...</p>
        </div>
      </div>
    );
  }

  // 1. UN-AUTHENTICATED LOGIN SCREEN (With 2-step OTP flow)
  if (!isAuthenticated) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginCard}>
          <img src="/bin-shabib-group.webp" alt="Logo" className={styles.loginLogo} />
          
          {!otpRequired ? (
            // STEP 1: Username + Password Form
            <div>
              <h2>Admin Portal Sign In</h2>
              <p>Provide secure credentials to enter your management dashboard</p>

              {loginError && <div className={styles.statusError} style={{ padding: "8px 12px", fontSize: "12px", marginBottom: "16px" }}>{loginError}</div>}

              <form onSubmit={handleLoginSubmit}>
                <div className={styles.formGroup} style={{ marginBottom: "16px", textAlign: "left" }}>
                  <label className={styles.label}>Username</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. admin"
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "24px", textAlign: "left" }}>
                  <label className={styles.label}>Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className={styles.input}
                    required
                  />
                </div>

                <button type="submit" disabled={loggingIn} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: "100%", padding: "12px" }}>
                  {loggingIn ? "Verifying Credentials..." : "Continue"}
                </button>
              </form>
            </div>
          ) : (
            // STEP 2: One-Time Password Verification Form
            <div>
              <h2>Enter Security OTP Code</h2>
              
              {otpMfaType === "Email OTP" ? (
                <p>A 6-digit OTP code has been generated and sent to your email <strong>{otpEmailSentTo}</strong>.</p>
              ) : (
                <p>Open your 2FA authenticator app (Google Authenticator) and enter the 6-digit code for your account.</p>
              )}

              {loginError && <div className={styles.statusError} style={{ padding: "8px 12px", fontSize: "12px", marginBottom: "16px" }}>{loginError}</div>}

              <form onSubmit={handleOtpSubmit}>
                <div className={styles.formGroup} style={{ marginBottom: "20px", textAlign: "left" }}>
                  <label className={styles.label}>6-Digit OTP Code</label>
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 123456"
                    className={styles.input}
                    style={{ textAlign: "center", fontSize: "20px", letterSpacing: "4px", fontWeight: "bold" }}
                    maxLength={6}
                    required
                  />
                </div>

                {/* Local development mock helper so they can see code without opening console! */}
                {otpMockCode && (
                  <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "8px", fontSize: "11px", color: "#475569", marginBottom: "20px", border: "1px dashed #cbd5e1" }}>
                    ℹ️ Local Testing Mock OTP: <strong>{otpMockCode}</strong>
                  </div>
                )}

                <button type="submit" disabled={otpVerifying} className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: "100%", padding: "12px" }}>
                  {otpVerifying ? "Verifying Code..." : "Access Dashboard"}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpRequired(false); setLoginError(""); setOtpInput(""); }}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  style={{ width: "100%", padding: "10px", marginTop: "10px" }}
                >
                  &larr; Back to password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED: SHOW SPLIT SIDEBAR WORDPRESS-STYLE DASHBOARD
  return (
    <div className={styles.dashboardWrapper}>
      
      {/* LEFT SIDEBAR (Wordpress side menu) */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src="/bin-shabib-group.webp" alt="Logo" className={styles.sidebarLogo} />
          <div className={styles.sidebarTitle}>Bin Shabib Panel</div>
          <div className={styles.sidebarSub}>Role: {userRole}</div>
        </div>

        <nav className={styles.sidebarMenu}>
          <button
            onClick={() => { setActiveTab("welcome"); setStatusMessage(""); setErrorMessage(""); }}
            className={`${styles.menuItem} ${activeTab === "welcome" ? styles.menuItemActive : ""}`}
          >
            🏠 Welcome & stats
          </button>
          
          <button
            onClick={() => { setActiveTab("listings"); setStatusMessage(""); setErrorMessage(""); }}
            className={`${styles.menuItem} ${activeTab === "listings" ? styles.menuItemActive : ""}`}
          >
            🏢 Active Listings ({properties.length})
          </button>
          
          {/* Editor/Viewer Roles cannot see projects block */}
          {(userRole === "Super Admin" || userRole === "Manager" || userRole === "Viewer") && (
            <button
              onClick={() => { setActiveTab("upcoming"); setStatusMessage(""); setErrorMessage(""); }}
              className={`${styles.menuItem} ${activeTab === "upcoming" ? styles.menuItemActive : ""}`}
            >
              🏗️ Upcoming Projects ({upcomingProjects.length})
            </button>
          )}
          
          {/* Editors/Viewers cannot see Sync block */}
          {userRole !== "Editor" && userRole !== "Viewer" && (
            <button
              onClick={() => { setActiveTab("sync"); setStatusMessage(""); setErrorMessage(""); }}
              className={`${styles.menuItem} ${activeTab === "sync" ? styles.menuItemActive : ""}`}
            >
              🔄 Sync ERP Database
            </button>
          )}

          {/* User Management block - ONLY visible to Super Admin */}
          {userRole === "Super Admin" && (
            <button
              onClick={() => { setActiveTab("users"); setStatusMessage(""); setErrorMessage(""); }}
              className={`${styles.menuItem} ${activeTab === "users" ? styles.menuItemActive : ""}`}
            >
              👥 Portal Users ({portalUsers.length})
            </button>
          )}
          {userRole === "Super Admin" && <button onClick={() => { setActiveTab("bookings"); fetchBookings(); }} className={`${styles.menuItem} ${activeTab === "bookings" ? styles.menuItemActive : ""}`}>📋 Booking Requests ({bookings.length})</button>}
          {userRole === "Super Admin" && <button onClick={() => { setActiveTab("nationality-rules"); fetchNationalityRules(); }} className={`${styles.menuItem} ${activeTab === "nationality-rules" ? styles.menuItemActive : ""}`}>🛡️ Nationality Rules ({nationalityRules.filter((rule) => rule.isActive).length})</button>}
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ padding: "0 16px 12px", fontSize: "11px", color: "rgba(255, 255, 255, 0.4)" }}>
            Logged in as: <strong>{userUsername}</strong>
          </div>
          <button onClick={handleLogout} className={styles.menuItem} style={{ color: "#f87171" }}>
            🚪 Log Out Session
          </button>
          <div className={styles.developerCredit}>
            Developed by <span>MUHAMMAD BILAL</span>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT PANEL */}
      <main className={styles.contentArea}>
        
        {/* Messages */}
        {statusMessage && <div className={styles.statusBanner}>{statusMessage}</div>}
        {errorMessage && <div className={styles.statusError}>{errorMessage}</div>}

        {/* TAB 1: WELCOME SCREEN */}
        {activeTab === "welcome" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>Dashboard Home</h2>
                <p>Welcome, {userUsername}! Access Level: {userRole}</p>
              </div>
            </div>

            <div className={styles.welcomeBanner}>
              <h3>Welcome to ABDULWAHED BIN SHABIB REAL ESTATE L.L.C Portal</h3>
              <p>
                From this panel, you can manage active property listings, publish new upcoming projects, and coordinate users. Depending on your administrative group role, different functionalities are enabled.
              </p>
              <p style={{ fontWeight: 600, color: "#0f4c81" }}>
                Notice: The portal is configured for direct owner management of ABDULWAHED BIN SHABIB REAL ESTATE L.L.C residential and commercial rental portfolios.
              </p>
            </div>

            {/* WordPress Statistics Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏢</div>
                <div className={styles.statInfo}>
                  <div className={styles.statTitle}>Active Properties</div>
                  <div className={styles.statValue}>{properties.length}</div>
                </div>
              </div>

              {(userRole === "Super Admin" || userRole === "Manager" || userRole === "Viewer") && (
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🏗️</div>
                  <div className={styles.statInfo}>
                    <div className={styles.statTitle}>Upcoming Projects</div>
                    <div className={styles.statValue}>{upcomingProjects.length}</div>
                  </div>
                </div>
              )}

              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statInfo}>
                  <div className={styles.statTitle}>Account Access</div>
                  <div className={styles.statValue} style={{ fontSize: "14px", fontWeight: "700" }}>{userRole}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🔌</div>
                <div className={styles.statInfo}>
                  <div className={styles.statTitle}>System Database</div>
                  <div className={styles.statValue} style={{ fontSize: "14px", color: "#16a34a", fontWeight: "700" }}>SQLite Live</div>
                </div>
              </div>
            </div>

            <h3>Quick Administrative Tasks</h3>
            <div className={styles.quickActionsGrid} style={{ marginTop: "16px" }}>
              {(userRole === "Super Admin" || userRole === "Manager") && (
                <div onClick={() => setActiveTab("upcoming")} className={styles.actionCard}>
                  <h4>🏗️ Publish Upcoming Project</h4>
                  <p>Post a new building launch under Browse New Projects section with handover quarters and prices.</p>
                </div>
              )}
              {(userRole === "Super Admin" || userRole === "Manager") && (
                <div onClick={() => setActiveTab("sync")} className={styles.actionCard}>
                  <h4>🔄 Synchronize Web ERP</h4>
                  <p>Trigger the automatic sync task to merge records from the master developer property API.</p>
                </div>
              )}
              {userRole === "Super Admin" && (
                <div onClick={() => setActiveTab("users")} className={styles.actionCard}>
                  <h4>👥 Manage Portal Users ({portalUsers.length})</h4>
                  <p>Add/delete admin staff, assign access permissions and select MFA verification schemes.</p>
                </div>
              )}
              {userRole === "Super Admin" && <div onClick={() => setActiveTab("nationality-rules")} className={styles.actionCard}><h4>🛡️ Nationality Auto-Rejection</h4><p>Maintain the active nationalities that should be automatically declined on new bookings and enquiries.</p></div>}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE LISTINGS MANAGER */}
        {activeTab === "listings" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>Active Listings ({properties.length})</h2>
                <p>Property data is synchronized from ERP. Manual creation, edits, image uploads, and deletion are disabled.</p>
              </div>
            </div>

            {loadingListings ? (
              <div className={styles.loading}>Loading properties from database...</div>
            ) : (
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>Database Records</div>
                
                {properties.length === 0 ? (
                  <div className={styles.loading}>No listings found. Use Sync ERP Database to retrieve the latest property records.</div>
                ) : (
                  properties.map((prop) => {
                    let imagesList: string[] = [];
                    try {
                      imagesList = JSON.parse(prop.images || "[]");
                    } catch (e) {}

                    return (
                      <div key={prop.id} className={styles.row}>
                        <div className={styles.thumbnailContainer}>
                          {imagesList.length > 0 ? (
                            <img src={imagesList[0]} alt={prop.title} className={styles.thumbnail} />
                          ) : (
                            <div className={styles.noImage}>No Pictures</div>
                          )}
                        </div>

                        <div>
                          <div className={styles.propTitle}>{prop.title}</div>
                          <div className={styles.propLoc}>{prop.location}</div>
                        </div>

                        <div className={styles.price}>{formatPrice(prop.price)}</div>

                        <div className={styles.specs}>
                          {prop.beds} Beds | {prop.baths} Baths | {prop.area} Sq.Ft.
                        </div>

                        <div>
                          <span className={`${styles.badge} ${styles.badgeErp}`}>ERP {prop.erpId ? `(${prop.erpId})` : "Managed"}</span>
                        </div>

                        <div className={styles.actionCell}>
                          <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>ERP managed</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: UPCOMING PROJECTS MANAGER */}
        {activeTab === "upcoming" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>Upcoming Projects ({upcomingProjects.length})</h2>
                <p>Manage launches published in the Browse New Projects section on the homepage.</p>
              </div>
            </div>

            {/* Manually Add Project Form Box - Hidden from Editors/Viewers */}
            {userRole !== "Editor" && userRole !== "Viewer" && (
              <div className={styles.form} style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0b1a30" }}>
                  Add Upcoming Project Manually
                </h3>
                <form onSubmit={handleAddProjectSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Project Title *</label>
                      <input
                        type="text"
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                        placeholder="e.g. Provenza Residences"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Project Type *</label>
                      <select
                        value={projectForm.type}
                        onChange={(e) => setProjectForm({...projectForm, type: e.target.value})}
                        className={styles.select}
                      >
                        <option value="Apartments">Apartments</option>
                        <option value="Villas">Villas</option>
                        <option value="Townhouses">Townhouses</option>
                        <option value="Apartments & Penthouses">Apartments & Penthouses</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Location *</label>
                      <input
                        type="text"
                        value={projectForm.location}
                        onChange={(e) => setProjectForm({...projectForm, location: e.target.value})}
                        placeholder="e.g. JVC District 14, Dubai"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>City *</label>
                      <select
                        value={projectForm.city}
                        onChange={(e) => setProjectForm({...projectForm, city: e.target.value})}
                        className={styles.select}
                      >
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Sharjah">Sharjah</option>
                        <option value="Ajman">Ajman</option>
                        <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                        <option value="Umm Al Quwain">Umm Al Quwain</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Launch Price *</label>
                      <input
                        type="text"
                        value={projectForm.launchPrice}
                        onChange={(e) => setProjectForm({...projectForm, launchPrice: e.target.value})}
                        placeholder="e.g. AED 650K"
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Handover Date *</label>
                      <input
                        type="text"
                        value={projectForm.handover}
                        onChange={(e) => setProjectForm({...projectForm, handover: e.target.value})}
                        placeholder="e.g. Q3 2027"
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.label}>Description</label>
                      <textarea
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                        placeholder="Enter a brief teaser about this launch..."
                        className={styles.textarea}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label className={styles.label}>Cover Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProjectFile(e.target.files ? e.target.files[0] : null)}
                        className={styles.input}
                        style={{ padding: "8px" }}
                      />
                    </div>
                  </div>

                  <div className={styles.submitRow}>
                    <button type="submit" disabled={savingProject} className={`${styles.btn} ${styles.btnPrimary}`}>
                      {savingProject ? "Saving..." : "Publish Launch Project"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loadingUpcoming ? (
              <div className={styles.loading}>Loading upcoming projects...</div>
            ) : (
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>Currently Seeding Launches</div>
                
                {upcomingProjects.length === 0 ? (
                  <div className={styles.loading}>No upcoming projects published yet.</div>
                ) : (
                  upcomingProjects.map((project) => (
                    <div key={project.id} className={styles.row}>
                      <div className={styles.thumbnailContainer}>
                        <img src={project.image} alt={project.title} className={styles.thumbnail} />
                      </div>

                      <div>
                        <div className={styles.propTitle}>{project.title}</div>
                        <div className={styles.propLoc}>{project.location}</div>
                      </div>

                      <div className={styles.price}>{project.launchPrice}</div>

                      <div className={styles.specs}>
                        Type: {project.type} | City: {project.city}
                      </div>

                      <div>
                        <span className={`${styles.badge} ${styles.badgeManual}`} style={{ backgroundColor: "#0f4c81", color: "white" }}>
                          Handover {project.handover}
                        </span>
                      </div>

                      <div className={styles.actionCell}>
                        {userRole !== "Editor" && userRole !== "Viewer" ? (
                          <button onClick={() => handleDeleteProject(project.id)} className={`${styles.btn} ${styles.btnDanger}`}>
                            Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>View Only</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ADD ACTIVE PROPERTY FORM */}
        {activeTab === "add-property" && userRole !== "Viewer" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>ERP Property Management</h2>
                <p>Properties are read from the backend ERP database. Create or edit them in ERP, then run ERP Sync.</p>
              </div>
            </div>

            <form onSubmit={handleAddPropertySubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Property Title *</label>
                  <input
                    type="text"
                    value={listingForm.title}
                    onChange={(e) => setListingForm({...listingForm, title: e.target.value})}
                    placeholder="e.g. Signature Beachfront Villa | Saadiyat Island"
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Price (AED) *</label>
                  <input
                    type="number"
                    value={listingForm.price}
                    onChange={(e) => setListingForm({...listingForm, price: e.target.value})}
                    placeholder="e.g. 18500000"
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Location *</label>
                  <input
                    type="text"
                    value={listingForm.location}
                    onChange={(e) => setListingForm({...listingForm, location: e.target.value})}
                    placeholder="e.g. Saadiyat Island, Abu Dhabi"
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Property Type</label>
                  <select
                    value={listingForm.type}
                    onChange={(e) => setListingForm({...listingForm, type: e.target.value})}
                    className={styles.select}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Purpose (Rent is prioritized)</label>
                  <select
                    value={listingForm.purpose}
                    onChange={(e) => setListingForm({...listingForm, purpose: e.target.value})}
                    className={styles.select}
                  >
                    <option value="Rent">Rent (Lease)</option>
                    <option value="Buy">Buy (For Sale)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    value={listingForm.status}
                    onChange={(e) => setListingForm({...listingForm, status: e.target.value})}
                    className={styles.select}
                  >
                    <option value="Ready">Ready</option>
                    <option value="Off-Plan">Off-Plan</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Area (Sq. Ft.) *</label>
                  <input
                    type="number"
                    value={listingForm.area}
                    onChange={(e) => setListingForm({...listingForm, area: e.target.value})}
                    placeholder="e.g. 7200"
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Bedrooms</label>
                  <input
                    type="number"
                    value={listingForm.beds}
                    onChange={(e) => setListingForm({...listingForm, beds: e.target.value})}
                    min="0"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Bathrooms</label>
                  <input
                    type="number"
                    value={listingForm.baths}
                    onChange={(e) => setListingForm({...listingForm, baths: e.target.value})}
                    min="0"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={listingForm.description}
                    onChange={(e) => setListingForm({...listingForm, description: e.target.value})}
                    placeholder="Detailed overview about rooms, views, amenities, community specs..."
                    className={styles.textarea}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label className={styles.label}>Property Pictures</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setListingImages(e.target.files)}
                    className={styles.input}
                    style={{ border: "1px dashed #cbd5e1", padding: "14px" }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    Hold Ctrl or Cmd to select multiple files.
                  </span>
                </div>
              </div>

              <div className={styles.submitRow}>
                    <button type="submit" disabled className={`${styles.btn} ${styles.btnPrimary}`}>
                      Managed in ERP
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: SYNC ENGINE */}
        {activeTab === "sync" && userRole !== "Editor" && userRole !== "Viewer" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>Sync Properties from ERP</h2>
                <p>Fetch and update the latest property information from the approved ERP source.</p>
              </div>
            </div>

            <div className={styles.welcomeBanner}>
              <h3>ERP Data Integrations</h3>
              <p>
                Pressing the sync trigger updates the website with ERP-managed property details, including pricing, availability, features, locations, and images. Properties cannot be created or changed manually in this portal.
              </p>

              <button
                onClick={handleSyncErp}
                disabled={syncing}
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ padding: "14px 28px", marginTop: "12px", fontSize: "15px" }}
              >
                {syncing ? "Merging Database Records..." : "🔄 Execute Web ERP Sync"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: USERS MANAGEMENT (Only Super Admin) */}
        {activeTab === "users" && userRole === "Super Admin" && (
          <div>
            <div className={styles.contentHeader}>
              <div>
                <h2>Portal User Accounts</h2>
                <p>Manage administrative profiles, access groups, and security verification types.</p>
              </div>
            </div>

            {/* Add User Form */}
            <div className={styles.form} style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0b1a30" }}>
                Add New Staff Account
              </h3>
              <form onSubmit={handleCreateUserSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Username *</label>
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                      placeholder="e.g. jsmith"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Password *</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      placeholder="••••••••••••"
                      required
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      placeholder="e.g. user@abdulwahedbinshaibproperty.com"
                      required
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Access Permission *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      className={styles.select}
                    >
                      <option value="Super Admin">Super Admin (Full Access)</option>
                      <option value="Manager">Manager (Edit properties & projects)</option>
                      <option value="Editor">Editor (Edit properties only)</option>
                      <option value="Viewer">Viewer (View-only dashboard)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Security Verification Type (MFA) *</label>
                    <select
                      value={userForm.mfaType}
                      onChange={(e) => setUserForm({...userForm, mfaType: e.target.value})}
                      className={styles.select}
                    >
                      <option value="Email OTP">Email OTP Code (6-Digit)</option>
                      <option value="Google Authenticator">Google Authenticator App (TOTP)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.submitRow}>
                  <button type="submit" disabled={savingUser} className={`${styles.btn} ${styles.btnPrimary}`}>
                    {savingUser ? "Adding Account..." : "Create User Account"}
                  </button>
                </div>
              </form>
            </div>

            {/* Users list table */}
            {loadingUsers ? (
              <div className={styles.loading}>Loading system accounts...</div>
            ) : (
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>Active System Staff Profiles</div>

                {portalUsers.length === 0 ? (
                  <div className={styles.loading}>No users found.</div>
                ) : (
                  portalUsers.map((user) => (
                    <div key={user.id} className={styles.row} style={{ gridTemplateColumns: "1.5fr 2fr 1.2fr 1.8fr 1fr" }}>
                      <div>
                        <div className={styles.propTitle}>👤 {user.username}</div>
                        <div className={styles.propLoc}>Registered: {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div style={{ fontSize: "14px", color: "#475569" }}>
                        📧 {user.email}
                      </div>

                      <div>
                        <span
                          className={styles.badge}
                          style={{
                            backgroundColor:
                              user.role === "Super Admin"
                                ? "#fee2e2"
                                : user.role === "Manager"
                                ? "#fef3c7"
                                : user.role === "Editor"
                                ? "#e0f2fe"
                                : "#f1f5f9",
                            color:
                              user.role === "Super Admin"
                                ? "#991b1b"
                                : user.role === "Manager"
                                ? "#92400e"
                                : user.role === "Editor"
                                ? "#075985"
                                : "#475569",
                          }}
                        >
                          {user.role}
                        </span>
                      </div>

                      <div>
                        <span className={`${styles.badge} ${styles.badgeErp}`}>
                          🔒 {user.mfaType}
                        </span>
                        
                        {user.mfaType === "Google Authenticator" && user.otpSecret && (
                          <button
                            type="button"
                            onClick={() => openQrModal(user.username, user.otpSecret || "")}
                            className={styles.uploadLabel}
                            style={{ marginLeft: "10px", padding: "2px 6px", fontSize: "10px" }}
                          >
                            Scan QR Code
                          </button>
                        )}
                      </div>

                      <div className={styles.actionCell} style={{ alignItems: "flex-end" }}>
                        {user.username !== userUsername ? (
                          <button onClick={() => handleDeleteUser(user.id, user.username)} className={`${styles.btn} ${styles.btnDanger}`}>
                            Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>You</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "nationality-rules" && userRole === "Super Admin" && <div>
          <div className={styles.contentHeader}><div><h2>Nationality Auto-Rejection Configuration</h2><p>Active rules automatically decline matching booking and enquiry submissions. Deactivated rules are kept for reference and do not block submissions.</p></div></div>
          <div className={styles.welcomeBanner}>
            <h3>Manage eligibility rules</h3>
            <form onSubmit={saveNationalityRule} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
              <select className={styles.input} style={{ maxWidth: "360px" }} value={nationalityInput} onChange={(event) => setNationalityInput(event.target.value)} aria-label="Nationality">
                <option value="">Select a country / nationality</option>
                {nationalityCodes.map((code) => { const name = countryNames.of(code) || code; return <option key={code} value={name}>{name}</option>; })}
              </select>
              <button type="submit" disabled={savingNationalityRule} className={`${styles.btn} ${styles.btnPrimary}`}>{savingNationalityRule ? "Saving..." : editingRuleId ? "Update nationality" : "Add nationality"}</button>
              {editingRuleId && <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setEditingRuleId(null); setNationalityInput(""); }}>Cancel</button>}
            </form>
          </div>
          <div className={styles.tableCard} style={{ marginTop: "20px" }}>
            <div className={styles.tableHeader}>Configured nationalities ({nationalityRules.length})</div>
            {nationalityRules.length === 0 ? <div className={styles.loading}>No auto-rejection rules are configured. All nationalities are currently allowed.</div> : nationalityRules.map((rule) => <div key={rule.id} className={styles.row} style={{ gridTemplateColumns: "1.8fr 1fr 1.5fr" }}>
              <div><div className={styles.propTitle}>{rule.nationality}</div><div className={styles.propLoc}>Applied automatically to new bookings and enquiries</div></div>
              <div><span className={`${styles.badge} ${rule.isActive ? styles.badgeErp : styles.badgeManual}`}>{rule.isActive ? "Active" : "Inactive"}</span></div>
              <div className={styles.actionCell} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setEditingRuleId(rule.id); setNationalityInput(rule.nationality); }}>Edit</button>
                <button className={`${styles.btn} ${rule.isActive ? styles.btnDanger : styles.btnPrimary}`} onClick={() => updateNationalityRule(rule.id, { isActive: !rule.isActive })}>{rule.isActive ? "Deactivate" : "Activate"}</button>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => removeNationalityRule(rule.id)}>Remove</button>
              </div>
            </div>)}
          </div>
        </div>}

        {activeTab === "bookings" && <div>
          <div className={styles.contentHeader}><div><h2>Booking Requests ({bookings.length})</h2><p>Review customer details, passport documents, and availability status.</p></div></div>
          <div className={styles.bookingGrid}>{bookings.length === 0 ? <p className={styles.loading}>No booking requests yet.</p> : bookings.map((booking) => <article key={booking.id} className={styles.bookingCard}>
            <div className={styles.bookingCardTop}><span className={styles.bookingRef}>Booking #{booking.id}</span><span className={`${styles.bookingStatus} ${booking.status === "Confirmed" ? styles.bookingConfirmed : booking.status === "Declined" ? styles.bookingDeclined : ""}`}>{booking.status}</span></div>
            <h3>{booking.propertyName}</h3><div className={styles.bookingCustomer}><div className={styles.customerAvatar}>{booking.name.slice(0, 1).toUpperCase()}</div><div><strong>{booking.name}</strong><span>{booking.nationality}</span></div></div>
            <div className={styles.bookingMeta}><span>✉ {booking.email}</span><span>☎ {booking.phone}</span></div>
            <div className={styles.bookingActions}><button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setSelectedBooking(booking)}>View full details</button>{booking.status === "Pending" && <><button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => updateBookingStatus(booking.id, "Confirmed")}>Confirm</button><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => updateBookingStatus(booking.id, "Declined")}>Decline</button></>}</div>
          </article>)}</div>
        </div>}
      </main>

      {selectedBooking && <div className={styles.bookingModalBackdrop}><div className={styles.bookingDetailModal}>
        <button className={styles.closeBookingModal} onClick={() => setSelectedBooking(null)} aria-label="Close booking details">×</button>
        <div className={styles.bookingDetailHeader}><span>Booking #{selectedBooking.id}</span><h2>{selectedBooking.propertyName}</h2><p>Submitted {new Date(selectedBooking.createdAt).toLocaleString()}</p></div>
        <div className={styles.detailGrid}><div><small>Customer</small><strong>{selectedBooking.name}</strong></div><div><small>Nationality</small><strong>{selectedBooking.nationality}</strong></div><div><small>Email</small><strong>{selectedBooking.email}</strong></div><div><small>Phone</small><strong>{selectedBooking.phone}</strong></div></div>
        <div className={styles.passportPanel}><div><small>Passport document</small><strong>{selectedBooking.passportPath ? "Uploaded securely" : "Not available"}</strong></div>{selectedBooking.passportPath && <a href={`/api/admin/bookings/${selectedBooking.id}/passport`} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.btnPrimary}`}>View passport</a>}</div>
        {selectedBooking.passportPath && <iframe title="Customer passport document" src={`/api/admin/bookings/${selectedBooking.id}/passport`} className={styles.passportPreview} />}
        {selectedBooking.status === "Pending" && <div className={styles.modalBookingActions}><button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => updateBookingStatus(selectedBooking.id, "Confirmed")}>Confirm booking</button><button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => updateBookingStatus(selectedBooking.id, "Declined")}>Decline booking</button></div>}
      </div></div>}

      {/* GOOGLE AUTHENTICATOR QR CONFIG MODAL */}
      {showQrModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,26,48,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className={styles.loginCard} style={{ background: "white", padding: "30px", maxWidth: "460px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0b1a30", marginBottom: "8px" }}>
              2FA Authenticator Setup
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Scan the QR code below using your Google Authenticator or 2FA app to register <strong>{qrModalUsername}</strong>.
            </p>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "inline-block", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              {/* Dynamic Google API QR generator string */}
              <img
                src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(`otpauth://totp/BinShabib:${qrModalUsername}?secret=${qrModalSecret}&issuer=BinShabib`)}`}
                alt="Authenticator QR Code"
                style={{ width: "200px", height: "200px", display: "block" }}
              />
            </div>

            <div style={{ textAlign: "left", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Manual Key Entry</div>
              <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", color: "#0f4c81", fontFamily: "monospace", marginTop: "4px", textAlign: "center" }}>
                {qrModalSecret}
              </div>
            </div>

            <button
              onClick={() => { setShowQrModal(false); setQrModalSecret(""); setQrModalUsername(""); }}
              className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ width: "100%", padding: "12px" }}
            >
              Done & Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
