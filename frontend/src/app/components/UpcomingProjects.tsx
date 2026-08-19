"use client";

import React, { useState, useEffect } from "react";
import styles from "./upcomingProjects.module.css";

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
}

export default function UpcomingProjects() {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [activeCity, setActiveCity] = useState("Dubai");
  const [loading, setLoading] = useState(true);

  const cities = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Umm Al Quwain"];

  // useEffect(() => {
  //   setLoading(true);
  //   fetch("/api/upcoming-projects")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (Array.isArray(data)) {
  //         setProjects(data);
  //       }
  //       setLoading(false);
  //     })
  //     .catch((err) => {
  //       console.error("Error loading upcoming projects:", err);
  //       setLoading(false);
  //     });
  // }, []);

  const filteredProjects = projects.filter(
    (p) => p.city.toLowerCase() === activeCity.toLowerCase()
  );

  return (
    <section className={styles.section}>
      <div className={styles.headingArea}>
        <h2>Browse New Projects in UAE</h2>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setActiveCity(city)}
                className={`${styles.tab} ${activeCity === city ? styles.tabActive : ""}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
          Loading upcoming projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: "40px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          No upcoming projects listed in {activeCity} at the moment.
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <div key={project.id} className={styles.card}>
              {project.image && (
                <div className={styles.imageWrap}>
                  <img src={project.image} alt={`${project.title} project`} className={styles.image} />
                </div>
              )}
              <div className={styles.content}>
                <div className={styles.cardType}>{project.type}</div>
                <div className={styles.cardTitle}>{project.title}</div>
                <div className={styles.location}>
                  <span>📍</span> {project.location}
                </div>
                
                <div className={styles.infoBox}>
                  <div className={styles.infoCol}>
                    <div className={styles.infoLabel}>Launch Price</div>
                    <div className={styles.infoValue}>{project.launchPrice}</div>
                  </div>
                  <div className={styles.infoCol}>
                    <div className={styles.infoLabel}>Handover</div>
                    <div className={styles.infoValue}>{project.handover}</div>
                  </div>
                </div>

                <a 
                  href={`https://wa.me/97142545888?text=I%20am%20interested%20in%20the%20upcoming%20project%3A%20${encodeURIComponent(project.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.registerBtn}
                >
                  💬 Register Interest
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.bottomCta}>
        <a 
          href={`https://wa.me/97142545888?text=Hello%20Abdul%20Wahed%20Bin%20Shabib%20Real%20Estate%20team%2C%20I%20would%20like%20to%20know%20more%20about%20upcoming%20new%20projects%20in%20${activeCity}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          View all projects in {activeCity} &rarr;
        </a>
      </div>
    </section>
  );
}
