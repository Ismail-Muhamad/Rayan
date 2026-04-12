<!-- < -->
<template>
  <div class="editor">
    <p v-if="label" :for="label" class="editor__label">
      {{ label }}
      <span v-if="required" class="editor__required">*</span>
    </p>
    <div class="editor__content">
      <QuillEditor
        ref="editorRef"
        v-model:html="content"
        :options="EDITOR_OPTIONS"
        theme="snow"
        @update:content="updateContent"
        contentType="html"
      />
    </div>
    <div
      v-if="error || hint || $slots.errors || $slots.hint"
      class="editor__helpers"
    >
      <!-- hint -->
      <slot name="hint">
        <p v-if="hint" class="editor__hint">
          {{ hint }}
        </p>
      </slot>
      <!-- error -->
      <div v-if="error && ($slots.errors || errorText)" class="editor__errors">
        <slot name="errors">
          <p class="editor__error">
            {{ errorText }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, watch } from "vue";
// Stores
// Composables
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorText: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:model-value"]);
// ===== STORE INSTANCES =====
// ===== COMPOSABLES =====
// ===== CONSTANTS =====
const EDITOR_OPTIONS = {
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ direction: "rtl" }],
    ],
  },
};
// ===== REACTIVE STATE & TEMPLATE REFS =====
const content = ref(props.modelValue || "");
const editorRef = ref(null);
// ===== VALIDATION RULES =====
// ===== COMPUTED PROPERTIES =====
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const updateContent = (value) => {
  content.value = value;
  emit("update:model-value", value);
};
// ===== WATCHERS =====
watch(
  () => props.modelValue,
  (newValue) => {
    if (content.value !== newValue) {
      content.value = newValue || "";
      editorRef.value?.setHTML(newValue || "");
    }
  },
);
// ===== EXPOSE PUBLIC METHODS =====
</script>
<style lang="scss" scoped>
.editor {
  position: relative;
  &__label {
    font-size: 1.2rem;
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--blue-600);
    background-color: var(--white);
    position: absolute;
    top: 0;
    inset-inline-start: 12px;
    transform: translateY(-50%);
    z-index: 999;
  }

  &__required {
    color: var(--red-500);
    margin-inline-start: 8px;
  }
  &__helpers {
    margin-block-start: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__hint,
  &__length {
    font-size: 1.2rem;
    color: var(--gray-500);
  }

  &__length {
    align-self: end;
    position: absolute;

    &--invalid {
      color: var(--red-500);
    }
  }

  &__error {
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--red-500);
  }
}
</style>
