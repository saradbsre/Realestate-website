"use client";

import React from "react";
import styles from "./CommonAlert.module.css";

export type AlertType =
  | "success"
  | "error"
  | "warning"
  | "confirm";

interface CommonAlertProps {
  open: boolean;

  type:
    AlertType;

  title:
    string;

  message:
    string;

  confirmText?:
    string;

  cancelText?:
    string;

  showCancel?:
    boolean;

  inputRequired?:
    boolean;

  inputLabel?:
    string;

  inputPlaceholder?:
    string;

  inputValue?:
    string;

  loading?:
    boolean;

  onInputChange?: (
    value: string
  ) => void;

  onConfirm:
    () => void;

  onCancel?:
    () => void;
}

export default function CommonAlert({
  open,
  type,
  title,
  message,

  confirmText =
    "OK",

  cancelText =
    "Cancel",

  showCancel =
    false,

  inputRequired =
    false,

  inputLabel,

  inputPlaceholder,

  inputValue =
    "",

  loading =
    false,

  onInputChange,

  onConfirm,

  onCancel,
}: CommonAlertProps) {
  if (!open) {
    return null;
  }

  const icon =
    type === "success"
      ? "✓"
      : type === "error"
      ? "!"
      : type === "warning"
      ? "!"
      : "?";

  return (
    <div
      className={
        styles.alertBackdrop
      }
    >
      <div
        className={
          styles.alertModal
        }
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`${styles.alertIcon} ${
            type === "success"
              ? styles.successIcon
              : type === "error"
              ? styles.errorIcon
              : type === "warning"
              ? styles.warningIcon
              : styles.confirmIcon
          }`}
        >
          {icon}
        </div>

        <h3
          className={
            styles.alertTitle
          }
        >
          {title}
        </h3>

        <p
          className={
            styles.alertMessage
          }
        >
          {message}
        </p>

        {inputRequired && (
          <div
            className={
              styles.alertInputGroup
            }
          >
            {inputLabel && (
              <label
                className={
                  styles.alertLabel
                }
              >
                {inputLabel}
              </label>
            )}

            <textarea
              value={
                inputValue
              }
              onChange={(
                event
              ) =>
                onInputChange?.(
                  event.target.value
                )
              }
              placeholder={
                inputPlaceholder
              }
              className={
                styles.alertTextarea
              }
              rows={4}
              autoFocus
            />
          </div>
        )}

        <div
          className={
            styles.alertActions
          }
        >
          {showCancel && (
            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onCancel
              }
              className={
                styles.cancelButton
              }
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            disabled={
              loading ||
              (
                inputRequired &&
                !inputValue.trim()
              )
            }
            onClick={
              onConfirm
            }
            className={`${styles.confirmButton} ${
              type === "error" ||
              type === "warning"
                ? styles.dangerButton
                : ""
            }`}
          >
            {loading
              ? "Please wait..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}