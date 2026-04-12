<template>
  <div>
    <slot name="action" :close="close" :open="open" :toggle="toggle"></slot>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="isOpen"
          class="modal"
          :class="{ 'modal--start': position === 'start' }"
          @click.self="handleClickBackdrop"
          @keydown.esc="handleEsc"
        >
          <Transition name="modal-scale">
            <div
              v-if="isOpen"
              class="modal__wrapper"
              :class="[
                `modal__wrapper--${size}`,
                { 'modal__wrapper--shake': isShake },
              ]"
            >
              <!-- Header -->
              <div class="modal__header">
                <div class="modal__info">
                  <h2 v-if="title" class="modal__title">
                    {{ title }}
                  </h2>
                  <BaseButton
                    color="gray"
                    variant="ghost"
                    size="icon-sm"
                    @click="close"
                  >
                    <BaseIcon name="mdi:close" :width="16" :height="16" />
                  </BaseButton>
                </div>
                <p v-if="subtitle" class="modal__subtitle">
                  {{ subtitle }}
                </p>
              </div>

              <!-- Content -->
              <div class="modal__content">
                <slot name="content" :close="close"> </slot>
              </div>
              <!-- Footer -->
              <div class="modal__footer">
                <slot name="footer" :close="close"> </slot>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, watch, onMounted, onUnmounted } from "vue";
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "sm",
    validator: (value) => ["sm", "md", "lg", "xl", "full"].includes(value),
  },
  closeOnBackdrop: {
    type: Boolean,
    default: false,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: "center",
    validator: (value) => ["center", "start"].includes(value),
  },
});

// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const isOpen = ref(false);
const isShake = ref(false);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const open = () => {
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const toggle = () => {
  isOpen.value = !isOpen.value;
};
const handleClickBackdrop = () => {
  if (props.closeOnBackdrop && !props.persistent) {
    close();
  } else {
    triggerShake();
  }
};

const handleEsc = (e) => {
  if (props.closeOnEsc && isOpen.value) {
    e.stopPropagation();
    close();
  }
};

const triggerShake = () => {
  isShake.value = true;
  setTimeout(() => {
    isShake.value = false;
  }, 300);
};

// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
defineExpose({
  open,
  close,
  toggle,
});
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  padding: 16px;

  &--start {
    align-items: flex-start;
    padding-top: 60px;
  }

  &__wrapper {
    position: relative;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    background-color: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-xl);
    transition: transform 300ms ease-in-out;

    // Sizes
    &--sm {
      max-width: 480px;
    }
    &--md {
      max-width: 640px;
    }
    &--lg {
      max-width: 960px;
    }
    &--xl {
      max-width: 1280px;
    }
    &--full {
      max-width: 95vw;
      height: 90vh;
    }

    // Shake animation
    &--shake {
      animation: modal-shake 300ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
  }

  // Header
  &__header {
    flex-shrink: 0;
    padding: 8px 16px;
    border-bottom: 1px solid var(--gray-300);
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--gray-900);
  }

  &__subtitle {
    font-size: 1.4rem;
    color: var(--gray-500);
    margin-block-start: 2px;
  }

  // Content
  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  // Footer
  &__footer {
    flex-shrink: 0;
    padding: 16px;
    border-top: 1px solid var(--gray-300);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
}

// Fade Animation
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

// Scale Animation
.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes modal-shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
