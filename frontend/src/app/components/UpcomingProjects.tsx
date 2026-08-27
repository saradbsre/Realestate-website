"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MapPin,
  
} from "lucide-react";
import styles
  from "./upcomingProjects.module.css";

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface UpcomingProject {
  id: string;

  title: string;

  placeId: string;
  placeName: string;

  areaId:
    string | null;

  areaName:
    string | null;

  buildArea:
    number | null;

  image:
    string | null;

  description:
    string | null;

  isUpcomingProject:
    boolean;

  isActive:
    boolean;
}

export default function UpcomingProjects() {
  const [
    projects,
    setProjects,
  ] = useState<
    UpcomingProject[]
  >([]);

  const [
    activePlaceId,
    setActivePlaceId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* ============================================
     LOAD UPCOMING PROJECTS
  ============================================ */

  useEffect(() => {
    let cancelled =
      false;

    async function loadProjects() {
      try {
        setLoading(
          true
        );

        setError("");

        const response =
          await fetch(
            `${API_URL}/api/upcoming-projects`,
            {
              cache:
                "no-store",
            }
          );

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result.error ||
              "Unable to load upcoming projects."
          );
        }

        const data:
          UpcomingProject[] =
          Array.isArray(
            result.data
          )
            ? result.data
            : [];

        if (
          cancelled
        ) {
          return;
        }

        setProjects(
          data
        );

        if (
          data.length >
            0
        ) {
          setActivePlaceId(
            (
              current
            ) =>
              current ||
              data[0]
                .placeId
          );
        }
      } catch (error) {
        if (
          cancelled
        ) {
          return;
        }

        console.error(
          "Upcoming project load failed:",
          error
        );

        setProjects(
          []
        );

        setError(
          error instanceof
            Error
            ? error.message
            : "Unable to load upcoming projects."
        );
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    loadProjects();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* ============================================
     UNIQUE PLACES FROM DB
  ============================================ */

  const places =
    useMemo(() => {
      const unique =
        new Map<
          string,
          string
        >();

      projects.forEach(
        (
          project
        ) => {
          const placeId =
            project.placeId?.trim();

          const placeName =
            project.placeName?.trim();

          if (
            placeId &&
            placeName
          ) {
            unique.set(
              placeId,
              placeName
            );
          }
        }
      );

      return Array.from(
        unique.entries()
      ).map(
        ([
          placeId,
          placeName,
        ]) => ({
          placeId,
          placeName,
        })
      );
    }, [projects]);

  /* ============================================
     FILTER PROJECTS BY PLACE
  ============================================ */

  const filteredProjects =
    useMemo(() => {
      if (
        !activePlaceId
      ) {
        return projects;
      }

      return projects.filter(
        (
          project
        ) =>
          project.placeId?.trim() ===
          activePlaceId
      );
    }, [
      projects,
      activePlaceId,
    ]);

  /* ============================================
     SELECTED PLACE NAME
  ============================================ */

  const activePlaceName =
    useMemo(() => {
      return (
        places.find(
          (
            place
          ) =>
            place.placeId ===
            activePlaceId
        )?.placeName ||
        ""
      );
    }, [
      places,
      activePlaceId,
    ]);

  /* ============================================
     LOCATION
  ============================================ */

  const getLocation = (
    project:
      UpcomingProject
  ) => {
    const areaName =
      project.areaName?.trim();

    const placeName =
      project.placeName?.trim();

    if (
      areaName &&
      placeName
    ) {
      return `${areaName}, ${placeName}`;
    }

    return (
      placeName ||
      areaName ||
      ""
    );
  };

  /* ============================================
     PROJECT IMAGE
  ============================================ */

  const hasProjectImage = (
    image:
      string | null
  ) => {
    return Boolean(
      image &&
        image.trim()
    );
  };

  return (
    <section
      className={
        styles.section
      }
    >
      {/* ========================================
          HEADING
      ======================================== */}

      <div
        className={
          styles.headingArea
        }
      >
        <h2>
          Browse New Projects
          in UAE
        </h2>

        {!loading &&
          places.length >
            0 && (
            <div
              className={
                styles.tabsContainer
              }
            >
              <div
                className={
                  styles.tabs
                }
              >
                {places.map(
                  (
                    place
                  ) => (
                    <button
                      key={
                        place.placeId
                      }
                      type="button"
                      onClick={() =>
                        setActivePlaceId(
                          place.placeId
                        )
                      }
                      className={`${styles.tab} ${
                        activePlaceId ===
                        place.placeId
                          ? styles.tabActive
                          : ""
                      }`}
                    >
                      {
                        place.placeName
                      }
                    </button>
                  )
                )}
              </div>
            </div>
          )}
      </div>

      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div
          className={
            styles.projectMessage
          }
        >
          Loading upcoming
          projects...
        </div>
      )}

      {/* ========================================
          ERROR
      ======================================== */}

      {!loading &&
        error && (
          <div
            className={
              styles.projectError
            }
          >
            {error}
          </div>
        )}

      {/* ========================================
          EMPTY
      ======================================== */}

      {!loading &&
        !error &&
        filteredProjects.length ===
          0 && (
          <div
            className={
              styles.projectEmpty
            }
          >
            No upcoming
            projects listed
            {activePlaceName
              ? ` in ${activePlaceName}`
              : ""}
            .
          </div>
        )}

      {/* ========================================
          PROJECT CARDS
      ======================================== */}

      {!loading &&
        !error &&
        filteredProjects.length >
          0 && (
          <div
            className={
              styles.grid
            }
          >
            {filteredProjects.map(
              (
                project
              ) => (
                <article
                  key={
                    project.id
                  }
                  className={
                    styles.card
                  }
                >
                  {/* =================================
                      IMAGE
                  ================================= */}

                  {hasProjectImage(
                    project.image
                  ) ? (
                    <div
                      className={
                        styles.imageWrap
                      }
                    >
                      <img
                        src={
                          project.image!
                        }
                        alt={
                          project.title
                        }
                        className={
                          styles.image
                        }
                        onError={(
                          event
                        ) => {
                          const image =
                            event.currentTarget;

                          image.style.display =
                            "none";

                          const parent =
                            image.parentElement;

                          if (
                            parent
                          ) {
                            parent.classList.add(
                              styles.noProjectImage
                            );

                            if (
                              !parent.querySelector(
                                "[data-image-placeholder]"
                              )
                            ) {
                              const placeholder =
                                document.createElement(
                                  "div"
                                );

                              placeholder.setAttribute(
                                "data-image-placeholder",
                                "true"
                              );

                              placeholder.innerHTML =
                                "<span>🏢</span>";

                              parent.appendChild(
                                placeholder
                              );
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`${styles.imageWrap} ${styles.noProjectImage}`}
                    >
                      <div>
                        <span style={{ opacity: "0.3" }}>
                          🏢
                        </span>

                       
                      </div>
                    </div>
                  )}

                  {/* =================================
                      CONTENT
                  ================================= */}

                  <div
                    className={
                      styles.content
                    }
                  >
                    <div
                      className={
                        styles.cardType
                      }
                    >
                      Upcoming
                      Project
                    </div>

                    <h3
                      className={
                        styles.cardTitle
                      }
                    >
                      {
                        project.title
                      }
                    </h3>

                    {/* LOCATION */}

                    <div
                      className={
                        styles.location
                      }
                    >
                      <span>
                         <MapPin
                                  size={
                                    16
                                  }
                                />
                      </span>

                      <span>
                        {getLocation(
                          project
                        )}
                      </span>
                    </div>

                    {/* BUILDING AREA */}

                    {project.buildArea !==
                      null &&
                      Number(
                        project.buildArea
                      ) >
                        0 && (
                        <div
                          className={
                            styles.infoBox
                          }
                        >
                          <div
                            className={
                              styles.infoCol
                            }
                          >
                            <div
                              className={
                                styles.infoLabel
                              }
                            >
                              Building
                              Area
                            </div>

                            <div
                              className={
                                styles.infoValue
                              }
                            >
                              {Number(
                                project.buildArea
                              ).toLocaleString(
                                "en-AE"
                              )}{" "}
                              Sq.Ft.
                            </div>
                          </div>
                        </div>
                      )}

                    {/* DESCRIPTION */}

                    {project.description?.trim() && (
                      <p
                        className={
                          styles.description
                        }
                      >
                        {
                          project.description
                        }
                      </p>
                    )}

                    {/* REGISTER INTEREST */}

                    <a
                      href={`https://wa.me/97142545888?text=${encodeURIComponent(
                        `Hello Abdul Wahed Bin Shabib Real Estate team, I am interested in the upcoming project ${project.title} located at ${getLocation(
                          project
                        )}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        styles.registerBtn
                      }
                    >
                      💬 Register
                      Interest
                    </a>
                  </div>
                </article>
              )
            )}
          </div>
        )}

      {/* ========================================
          BOTTOM CTA
      ======================================== */}

      {!loading &&
        !error &&
        activePlaceName && (
          <div
            className={
              styles.bottomCta
            }
          >
            <a
              href={`https://wa.me/97142545888?text=${encodeURIComponent(
                `Hello Abdul Wahed Bin Shabib Real Estate team, I would like to know more about upcoming new projects in ${activePlaceName}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={
                styles.ctaBtn
              }
            >
              View all projects
              in{" "}
              {activePlaceName}{" "}
              →
            </a>
          </div>
        )}
    </section>
  );
}