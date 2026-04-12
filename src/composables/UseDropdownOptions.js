/**
 * useDropdown Composable
 *
 * Reusable logic for managing dropdown menus with positioning,
 * animations, and keyboard navigation.
 *
 * This composable can be extracted and used across multiple components
 * that need dropdown functionality.
 */

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { onClickOutside } from "@vueuse/core";

export function useDropdown(triggerRef, dropdownRef, options = {}) {
  const {
    position = "auto",
    offset = 8,
    closeOnSelect = true,
    onOpen,
    onClose,
    closeOnClickOutside = true,
    closeOnEscape = true,
  } = options;
  // ===== STATE =====
  const isOpen = ref(false);
  const direction = ref("down");
  const positionStyle = ref({});

  // ===== COMPUTED =====
  const dropdownClasses = computed(() => ({
    "dropdown--open": isOpen.value,
    [`dropdown--${direction.value}`]: true,
  }));

  // Accessibility attributes
  const ariaAttributes = computed(() => ({
    "aria-expanded": isOpen.value,
    "aria-haspopup": true,
  }));
  // ===== HELPER: Get DOM element from ref (handles component instances) =====
  const getElement = (ref) => {
    if (!ref) return null;
    // If it's a component instance, get its root element
    if (ref.$el) return ref.$el;
    // Otherwise, it's already a DOM element
    return ref;
  };

  // ===== POSITIONING LOGIC =====
  const calculatePosition = () => {
    const trigger = getElement(triggerRef.value);
    const dropdown = getElement(dropdownRef.value);

    if (!trigger || !dropdown) return;

    const triggerRect = trigger.getBoundingClientRect();

    const dropdownHeight = dropdown.offsetHeight;
    const dropdownWidth = dropdown.offsetWidth;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate available space
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.left;

    // Determine vertical direction
    let verticalDirection = "down";

    if (["up", "top"].includes(position)) {
      verticalDirection = "up";
    } else if (["down", "bottom"].includes(position)) {
      verticalDirection = "down";
    } else {
      // Auto: prefer down unless insufficient space
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        verticalDirection = "up";
      }
    }

    direction.value = verticalDirection;

    // Calculate position
    let top;
    let left = triggerRect.left;

    if (verticalDirection === "up") {
      top = triggerRect.top - dropdownHeight - offset;
    } else {
      top = triggerRect.bottom + offset;
    }

    // Adjust horizontal position if dropdown would overflow viewport
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8; // 8px margin
    }

    // Ensure dropdown doesn't go off-screen to the left
    if (left < 8) {
      left = 8;
    }

    // Apply position
    positionStyle.value = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      minWidth: `${triggerRect.width}px`,
      zIndex: "1000",
    };
  };

  // ===== OPEN/CLOSE METHODS =====
  const open = async () => {
    if (isOpen.value) return;

    isOpen.value = true;
    onOpen?.();

    await nextTick();
    // Use requestAnimationFrame to ensure layout is computed after v-if render
    window.requestAnimationFrame(() => {
      calculatePosition();
    });

    // Add event listeners
    if (closeOnEscape) {
      document.addEventListener("keydown", handleKeydown);
    }
  };

  const close = () => {
    if (!isOpen.value) return;

    isOpen.value = false;
    onClose?.();

    // Remove event listeners
    document.removeEventListener("keydown", handleKeydown);
  };

  const toggle = async () => {
    if (isOpen.value) {
      close();
    } else {
      await open();
    }
  };

  // ===== EVENT HANDLERS =====
  const handleKeydown = (event) => {
    if (event.key === "Escape" && isOpen.value) {
      close();
      const trigger = getElement(triggerRef.value);
      trigger?.focus();
    }
  };

  // Click outside to close
  if (closeOnClickOutside) {
    onClickOutside(dropdownRef, (event) => {
      // Ignore clicks on the trigger element
      const trigger = getElement(triggerRef.value);
      if (trigger && trigger.contains(event.target)) {
        return;
      }
      close();
    });
  }

  const handlePositionUpdate = () => {
    if (isOpen.value) {
      calculatePosition();
    }
  };

  // ===== LIFECYCLE =====
  onMounted(() => {
    window.addEventListener("scroll", handlePositionUpdate, true);
    window.addEventListener("resize", handlePositionUpdate);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handlePositionUpdate, true);
    window.removeEventListener("resize", handlePositionUpdate);
    document.removeEventListener("keydown", handleKeydown);
  });

  // Recalculate when dropdown opens
  watch(isOpen, (newVal) => {
    if (newVal) {
      nextTick(() => {
        window.requestAnimationFrame(() => {
          calculatePosition();
        });
      });
    }
  });

  // ===== RETURN API =====
  return {
    // State
    isOpen,
    direction,
    positionStyle,
    dropdownClasses,
    ariaAttributes,

    // Methods
    open,
    close,
    toggle,
    calculatePosition,

    // Utils
    closeOnSelect,
  };
}

// ===== ADVANCED: KEYBOARD NAVIGATION =====
/**
 * Enhanced keyboard navigation for dropdowns
 */
export function useDropdownKeyboard(options) {
  const {
    dropdownRef,
    isOpen,
    itemSelector = "button:not([disabled]), a:not([disabled])",
    loop = true,
  } = options;

  const focusedIndex = ref(-1);

  const getFocusableItems = () => {
    if (!dropdownRef.value) return [];
    return Array.from(dropdownRef.value.querySelectorAll(itemSelector));
  };

  const focusItem = (index) => {
    const items = getFocusableItems();
    if (items.length === 0) return;

    let targetIndex = index;

    if (loop) {
      targetIndex = ((index % items.length) + items.length) % items.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1));
    }

    focusedIndex.value = targetIndex;
    items[targetIndex]?.focus();
  };

  const focusNext = () => {
    focusItem(focusedIndex.value + 1);
  };

  const focusPrevious = () => {
    focusItem(focusedIndex.value - 1);
  };

  const focusFirst = () => {
    focusItem(0);
  };

  const focusLast = () => {
    const items = getFocusableItems();
    focusItem(items.length - 1);
  };

  const handleKeyboardNavigation = (event) => {
    if (!isOpen.value) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (focusedIndex.value === -1) {
          focusFirst();
        } else {
          focusNext();
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (focusedIndex.value === -1) {
          focusLast();
        } else {
          focusPrevious();
        }
        break;

      case "Home":
        event.preventDefault();
        focusFirst();
        break;

      case "End":
        event.preventDefault();
        focusLast();
        break;
    }
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeyboardNavigation);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyboardNavigation);
  });

  return {
    focusedIndex,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
}
