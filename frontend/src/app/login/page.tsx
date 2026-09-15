"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import styles from "./login.module.css";


const TEMP_PASSWORD =
  "AWS2026";


export default function LoginPage() {
  const router =
    useRouter();

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  function handleLogin(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      password !==
      TEMP_PASSWORD
    ) {
      setError(
        "Incorrect password."
      );

      return;
    }

    localStorage.setItem(
      "internal_site_access",
      "allowed"
    );

    router.replace("/");
  }


  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.loginCard
        }
      >
        <h1>
          Internal Access
        </h1>

        <p>
          This website is currently
          under internal testing.
          Enter the access password
          to continue.
        </p>

        <form
          onSubmit={
            handleLogin
          }
        >
          <label>
            Access Password
          </label>

          <input
            type="password"
            value={
              password
            }
            onChange={(
              event
            ) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Enter password"
            autoFocus
          />

          {error && (
            <div
              className={
                styles.error
              }
            >
              {error}
            </div>
          )}

          <button
            type="submit"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}