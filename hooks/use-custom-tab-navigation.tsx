"use client";

import { useEffect, useCallback } from "react";

export function useCustomTabNavigation() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle Tab key
    if (event.key !== "Tab") return;

    // Get all elements with 'important' class that are focusable
    const importantElements = document.querySelectorAll(
      ".important"
    ) as NodeListOf<HTMLElement>;

    // Filter to only include focusable elements (inputs, textareas, selects, buttons)
    const focusableImportantElements = Array.from(importantElements).filter(
      (element) => {
        const tagName = element.tagName.toLowerCase();
        const isInput = ["input", "textarea", "select", "button"].includes(
          tagName
        );
        const isNotDisabled = !element.hasAttribute("disabled");
        const isVisible = element.offsetParent !== null; // Check if element is visible

        return isInput && isNotDisabled && isVisible;
      }
    );

    if (focusableImportantElements.length === 0) return;

    // Prevent default tab behavior
    event.preventDefault();

    // Find currently focused element
    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = focusableImportantElements.indexOf(currentElement);

    let nextIndex: number;

    if (event.shiftKey) {
      // Shift+Tab: go to previous important element
      nextIndex =
        currentIndex <= 0
          ? focusableImportantElements.length - 1
          : currentIndex - 1;
    } else {
      // Tab: go to next important element
      nextIndex =
        currentIndex >= focusableImportantElements.length - 1
          ? 0
          : currentIndex + 1;
    }

    // Focus the next/previous important element
    focusableImportantElements[nextIndex]?.focus();
  }, []);

  useEffect(() => {
    // Add event listener to document
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Function to manually focus first important element
  const focusFirstImportant = useCallback(() => {
    const firstImportant = document.querySelector(".important") as HTMLElement;
    if (firstImportant) {
      firstImportant.focus();
    }
  }, []);

  // Function to manually focus last important element
  const focusLastImportant = useCallback(() => {
    const importantElements = document.querySelectorAll(
      ".important"
    ) as NodeListOf<HTMLElement>;
    const focusableElements = Array.from(importantElements).filter(
      (element) => {
        const tagName = element.tagName.toLowerCase();
        const isInput = ["input", "textarea", "select", "button"].includes(
          tagName
        );
        const isNotDisabled = !element.hasAttribute("disabled");
        const isVisible = element.offsetParent !== null;

        return isInput && isNotDisabled && isVisible;
      }
    );

    const lastElement = focusableElements[focusableElements.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  return {
    focusFirstImportant,
    focusLastImportant,
  };
}
