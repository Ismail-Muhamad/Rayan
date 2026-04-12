<template>
  <div class="form__control">
    <label v-if="label" :for="label" class="form__label">
      {{ label }}
      <span v-if="required" class="form__required">*</span>
    </label>
    <div class="form__group">
      <div v-if="$slots.icon" class="form__icon">
        <slot name="icon"></slot>
      </div>
      <input
        :id="label"
        :class="[
          'form__input',
          {
            'form__input--invalid': error,
            'form__input--disabled': disabled,
            'form__input--readonly': readonly,
            'form__input--icon': $slots.icon,
            ...classNames,
          },
        ]"
        :type="inputTypeValue"
        :placeholder="placeholder"
        :value="modelValue"
        :name="label"
        autocomplete="off"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInputValueChange"
        @blur="handleInputBlur"
        @click="updateCursorPosition"
        @keyup="updateCursorPosition"
        @keypress="handleValidateNumberInput"
      />
      <div
        v-if="type === 'password'"
        class="form__show"
        @click="handleEyeClick"
      >
        <BaseIcon
          :name="eyeIconName"
          :width="16"
          :height="16"
          color="var(--gray-700)"
        />
      </div>
    </div>
    <div
      v-if="error || hint || maxLength || $slots.errors || $slots.hint"
      class="form__helpers"
    >
      <!-- hint -->
      <slot name="hint">
        <p v-if="hint" class="form__hint">
          {{ hint }}
        </p>
      </slot>
      <!-- length -->
      <p
        v-if="maxLength"
        :class="[
          'form__length',
          { 'form__length--invalid': isMaxLengthExceeded },
        ]"
      >
        {{ valueLength }} / {{ maxLength }}
      </p>
      <!-- error -->
      <div v-if="error && ($slots.errors || errorText)" class="form__errors">
        <slot name="errors">
          <p class="form__error">
            {{ errorText }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErabyInput",
  props: {
    label: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: "Enter input value",
    },
    type: {
      type: String,
      required: false,
      default: "text",
    },
    modelValue: {
      type: [String, Number, null],
      required: true,
    },
    error: {
      type: Boolean,
      required: false,
      default: false,
    },
    errorText: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
    required: {
      type: Boolean,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    classNames: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    min: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
    },
    maxLength: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      showPassword: false,
    };
  },
  computed: {
    eyeIconName() {
      return this.showPassword
        ? "fluent:eye-24-regular"
        : "fluent:eye-off-24-regular";
    },
    inputTypeValue() {
      return this.showPassword ? "text" : this.type;
    },
    isMaxLengthExceeded() {
      return this.maxLength && this.modelValue
        ? this.modelValue.length > this.maxLength
        : false;
    },
    valueLength() {
      return this.modelValue ? this.modelValue.length : 0;
    },
  },
  methods: {
    handleInputValueChange(event) {
      if (this.disabled) {
        return;
      }
      this.$emit("update:modelValue", String(event.target.value));
    },
    handleValidateNumberInput(event) {
      if (this.type === "number") {
        const char = String.fromCharCode(event.keyCode);
        if (!/[0-9]/.test(char)) {
          event.preventDefault();
        }
      }
    },
    handleInputBlur() {
      this.$emit("blur");
    },
    updateCursorPosition(event) {
      this.$emit("cursor-move", {
        position: event.target.selectionStart,
        target: event.target,
      });
    },
    handleEyeClick() {
      this.showPassword = !this.showPassword;
    },
  },
};
</script>

<style scoped lang="scss">
.form {
  &__control {
    position: relative;
  }

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

  &__group {
    position: relative;
    height: 48px;
  }

  &__icon {
    position: absolute;
    inset-inline-start: 12px;
    inset-block-start: 50%;
    transform: translateY(-50%);
    z-index: 9;
  }

  &__input {
    width: 100%;
    height: 100%;
    font-size: 1.4rem;
    background-color: var(--white);
    color: var(--gray-900);
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid var(--gray-300);
    position: relative;
    transition: border-color 300ms ease-in-out;

    &:focus-visible {
      border-color: var(--blue-500);
      box-shadow: 0 0 0 2px var(--blue-100);
    }

    &--icon {
      padding-inline-start: 48px;
    }

    &--disabled {
      background-color: var(--gray-50);
      cursor: not-allowed;
      border-color: var(--gray-200);

      &:focus-visible {
        background-color: var(--gray-50);
      }
    }

    &--readonly {
      cursor: not-allowed;
      border-color: var(--gray-200);
    }

    &--valid {
      border-color: var(--green-500);
    }

    &--invalid {
      border-color: var(--red-500);
    }

    &[type="number"]::-webkit-inner-spin-button,
    &[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type="number"] {
      -moz-appearance: textfield;
      appearance: textfield;
    }

    &::placeholder {
      color: var(--gray-400);
    }

    // Keep the background color of the input when Autofill
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-text-fill-color: var(--gray-900) !important;
      -webkit-box-shadow: 0 0 0 30px var(--white) inset !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  &__show {
    position: absolute;
    top: 50%;
    inset-inline-end: 4px;
    transform: translateY(-50%);
    height: 42px;
    width: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    cursor: pointer;
    border-radius: 4px;
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

  &__errors {
  }

  &__error {
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--red-500);
  }
}
</style>
