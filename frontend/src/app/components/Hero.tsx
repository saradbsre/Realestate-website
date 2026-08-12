"use client";

import React, { useState, useEffect } from "react";
import styles from "./hero.module.css";

interface HeroProps {
  onSearch: (filters: {
    purpose: string;
    location: string;
    status: string;
    type: string;
    beds: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  // Tabs
  const tabs = [
    { id: "properties", name: "Properties" },
    { id: "new-projects", name: "New Projects" },
    { id: "agents", name: "Agents" },
  ];
  const [activeTab, setActiveTab] = useState("properties");

  // Filter States
  const [purpose, setPurpose] = useState("Buy"); // Buy / Rent
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("All"); 
  const [type, setType] = useState("All"); 
  const [propertyCategory, setPropertyCategory] = useState("All Properties");
  const [propertyGroup, setPropertyGroup] = useState<"Residential" | "Commercial">("Residential");
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState("Yearly");
  const [beds, setBeds] = useState("All"); 
  const [priceRange, setPriceRange] = useState("All"); 

  const propertyCategories = {
    Residential: ["Apartment", "Villa", "Townhouse", "Penthouse", "Duplex", "Residential Building"],
    Commercial: ["Office", "Shop", "Warehouse", "Labour Camp", "Bulk Unit", "Land", "Floor", "Building", "Factory", "Industrial Land", "Mixed Use Land", "Showroom", "Other Commercial"],
  };
  
  // Autocomplete suggestions
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Agents list
  const agents = [
    { name: "Firas Bin Shabib", role: "Principal Partner / Luxury Specialist", spec: "Saadiyat Island & Palm Jumeirah", phone: "+971 50 111 2222", initial: "FB" },
    { name: "Sarah Ahmed", role: "Senior Portfolio Manager", spec: "Dubai Marina & Downtown", phone: "+971 50 333 4444", initial: "SA" },
    { name: "Marcus Vane", role: "Commercial & Retail Specialist", spec: "Business Bay & DIFC", phone: "+971 50 555 6666", initial: "MV" },
  ];

  // Load properties list to search against locally for autocomplete
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => setAllProperties(data))
      .catch((err) => console.error("Error loading suggestion list:", err));
  }, []);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const lowerVal = val.toLowerCase();
    const filtered = allProperties.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerVal) ||
        p.location.toLowerCase().includes(lowerVal)
    );
    setSuggestions(filtered.slice(0, 5)); // Limit to top 5 matches
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let minPrice = "";
    let maxPrice = "";
    if (priceRange !== "All") {
      const [min, max] = priceRange.split("-");
      minPrice = min;
      maxPrice = max || "";
    }

    onSearch({
      purpose,
      location,
      status: activeTab === "new-projects" ? "Off-Plan" : status,
      type,
      beds,
      minPrice,
      maxPrice,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.headingArea}>
        <h1>Real homes live here</h1>
        <p style={{ maxWidth: "680px", margin: "8px auto 0", fontSize: "16px", lineHeight: "1.5", fontWeight: 400 }}>
          Browse a wide range of quality apartments and villas across Dubai’s prime locations with options to suit every budget and lifestyle
        </p>
      </div>

      <div className={styles.searchCard}>
        {/* Top Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <span
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            >
              {tab.name}
            </span>
          ))}
        </div>

        {/* 1. PROPERTIES & NEW PROJECTS FORM */}
        {(activeTab === "properties" || activeTab === "new-projects") && (
          <form onSubmit={handleSearchSubmit}>
            {/* Row 1: Buy/Rent + Location + Search */}
            <div className={styles.filterRow1}>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => setPurpose("Buy")}
                  className={`${styles.toggleBtn} ${purpose === "Buy" ? styles.toggleBtnActive : ""}`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setPurpose("Rent")}
                  className={`${styles.toggleBtn} ${purpose === "Rent" ? styles.toggleBtnActive : ""}`}
                >
                  Rent
                </button>
              </div>

              {/* Location Input with Autocomplete suggestions under it */}
              <div className={styles.locationInputWrapper}>
                <span className={styles.locationIcon}>📍</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onBlur={() => {
                    // Small delay to let click navigate before suggestions disappear
                    setTimeout(() => setSuggestions([]), 200);
                  }}
                  placeholder="Enter location (e.g. Dubai Marina, Saadiyat Island)"
                  className={styles.locationInput}
                />

                {/* Suggestions Dropdown Card */}
                {suggestions.length > 0 && (
                  <div className={styles.autocompleteDropdown}>
                    {suggestions.map((item) => {
                      let imagesList: string[] = [];
                      try {
                        imagesList = JSON.parse(item.images || "[]");
                      } catch (e) {}

                      return (
                        <div
                          key={item.id}
                          onMouseDown={() => {
                            window.location.href = `/property/${item.id}`;
                          }}
                          className={styles.suggestionItem}
                        >
                          <img
                            src={imagesList[0] || "/luxury_villa_hero.jpg"}
                            alt={item.title}
                            className={styles.suggestionThumb}
                          />
                          <div className={styles.suggestionContent}>
                            <div className={styles.suggestionTitle}>{item.title}</div>
                            <div className={styles.suggestionMeta}>
                              📍 {item.location} • {item.beds} Bed • {item.type}
                            </div>
                          </div>
                          <div className={styles.suggestionPrice}>
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button type="submit" className={styles.searchBtn}>
                Search
              </button>
            </div>

            {/* Row 2: Status + property type + rental period + beds + price */}
            <div className={styles.filterRow2}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={activeTab === "new-projects"}
                className={styles.select}
              >
                <option value="All">All Statuses</option>
                <option value="Ready">Ready</option>
                <option value="Off-Plan">Off-Plan</option>
              </select>

              <div className={styles.propertyTypeWrapper}>
                <button type="button" className={styles.propertyTypeTrigger} onClick={() => setIsPropertyTypeOpen((isOpen) => !isOpen)} aria-expanded={isPropertyTypeOpen}>
                  <span>{propertyCategory}</span><span aria-hidden="true">⌄</span>
                </button>
                {isPropertyTypeOpen && (
                  <div className={styles.propertyTypePanel}>
                    <div className={styles.propertyTypeTabs}>
                      {(["Residential", "Commercial"] as const).map((group) => (
                        <button key={group} type="button" onClick={() => setPropertyGroup(group)} className={`${styles.propertyTypeTab} ${propertyGroup === group ? styles.propertyTypeTabActive : ""}`}>{group}</button>
                      ))}
                    </div>
                    <div className={styles.propertyCategoryGrid}>
                      {propertyCategories[propertyGroup].map((category) => (
                        <button key={category} type="button" className={`${styles.propertyCategoryOption} ${propertyCategory === category ? styles.propertyCategoryOptionActive : ""}`} onClick={() => { setPropertyCategory(category); setType(propertyGroup); setIsPropertyTypeOpen(false); }}>
                          <span className={styles.radioMark} aria-hidden="true" />{category}
                        </button>
                      ))}
                    </div>
                    <div className={styles.propertyTypeActions}>
                      <button type="button" className={styles.resetPropertyType} onClick={() => { setPropertyCategory("All Properties"); setType("All"); setIsPropertyTypeOpen(false); }}>Reset</button>
                      <button type="button" className={styles.donePropertyType} onClick={() => setIsPropertyTypeOpen(false)}>Done</button>
                    </div>
                  </div>
                )}
              </div>

              <select value={rentalPeriod} onChange={(e) => setRentalPeriod(e.target.value)} className={styles.select} aria-label="Rental period">
                <option value="Yearly">Yearly</option>
                <option value="Monthly">Monthly</option>
              </select>

              <select
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className={styles.select}
              >
                <option value="All">Beds & Baths</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className={styles.select}
              >
                <option value="All">Price (AED)</option>
                <option value="0-500000">Under 500k AED</option>
                <option value="500000-1500000">500k - 1.5M AED</option>
                <option value="1500000-4000000">1.5M - 4.0M AED</option>
                <option value="4000000-10000000">4.0M - 10M AED</option>
                <option value="10000000-">10M+ AED</option>
              </select>
            </div>
          </form>
        )}

        {/* 2. AGENTS TAB */}
        {activeTab === "agents" && (
          <div>
            <div className={styles.panelTitle}>Our Elite Broker Team</div>
            <div className={styles.panelSub}>Connect with certified professionals who know your target neighborhoods inside out.</div>

            <div className={styles.agentsGrid}>
              {agents.map((agent, i) => (
                <div key={i} className={styles.agentCard}>
                  <div className={styles.agentAvatar}>{agent.initial}</div>
                  <div className={styles.agentName}>{agent.name}</div>
                  <div className={styles.agentSpec}>{agent.spec}</div>
                  <div className={styles.agentPhone}>{agent.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
