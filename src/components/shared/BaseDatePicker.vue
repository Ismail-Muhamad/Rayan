<template>
  <div class="date">
    <div
      :class="[
        'date__wrapper',
        {
          'date__wrapper--error': error,
          'date__wrapper--with-label': !!label,
        },
      ]"
    >
      <div v-if="label" class="date__label">
        {{ label }}
        <span v-if="required" class="date__required">*</span>
        <div v-if="tooltip" class="date__tooltip" v-tooltip="tooltip">
          <BaseIcon
            name="solar:info-circle-broken"
            :width="16"
            :height="16"
            color="var(--gray-700)"
          />
        </div>
      </div>
      <VueDatePicker
        ref="datePicker"
        v-bind="$attrs"
        v-model="date"
        auto-apply
        @update:model-value="updateModelValue"
        placeholder="DD-MM-YYYY hh:mm A"
      >
        <template #input-icon>
          <div class="date__icon">
            <BaseIcon name="hugeicons:calendar-03" color="var(--blue-600)" />
          </div>
        </template>
        <template #clear-icon="{ clear }">
          <div class="date__clear">
            <BaseButton
              color="gray"
              variant="ghost"
              size="icon-sm"
              @click="clear"
            >
              <BaseIcon name="mdi:close" :width="16" :height="16" />
            </BaseButton>
          </div>
        </template>
      </VueDatePicker>
    </div>
    <div
      v-if="error || hint || $slots.errors || $slots.hint"
      class="date__helpers"
    >
      <!-- hint -->
      <slot name="hint">
        <p v-if="hint" class="date__hint">
          {{ hint }}
        </p>
      </slot>
      <!-- error -->
      <div v-if="error && ($slots.errors || errorText)" class="date__errors">
        <slot name="errors">
          <p class="date__error">
            {{ errorText }}
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseDatePicker",
  props: {
    label: {
      type: String,
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: "DD-MM-YYYY hh:mm A",
    },
    tooltip: {
      type: String,
      required: false,
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
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
    modelValue: {
      type: [String, Object, Date, Array, null],
      default: () => new Date(),
    },
  },
  data() {
    return {
      date: this.modelValue,
      formattings: {},
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        if (this.date !== newValue) {
          this.date = newValue;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateModelValue(value) {
      this.$emit("update:model-value", value);
    },
  },
};
</script>

<style lang="scss" scoped>
.date {
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    max-height: 50px;
    height: 48px;
    width: 100%;
    // border: 1px solid var(--gray-300);
    border-radius: 8px;

    &--with-label {
      // cursor: pointer;
      // background-color: var(--white);
      // color: var(--gray-900);
      // padding: 12px 16px;
      // border-radius: 8px;
    }

    &--error {
      border-color: #e55353;
    }
  }

  &__label {
    font-size: 1.2rem;
    color: var(--blue-600);
    background-color: var(--white);
    padding: 4px 8px;
    border-radius: 4px;
    position: absolute;
    top: 0;
    inset-inline-start: 12px;
    transform: translateY(-50%);
    z-index: 999;
    display: flex;
    align-items: center;
  }

  &__required {
    color: var(--red-500);
    margin-inline-start: 8px;
  }
  &__tooltip {
    cursor: pointer;
    margin-inline-start: 8px;
    line-height: 0;
  }

  &__icon {
    // position: absolute;
    // top: 50%;
    // right: 4px;
    // transform: translateY(-50%);
    height: 42px;
    width: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    // font-size: 1.6rem;
    /* background-color: #616161; */
    cursor: pointer;
  }
  &__clear {
    margin-inline-end: 8px;
  }

  &__value {
    font-size: 1.4rem;
    color: var(--gray-900);
    padding-inline-start: 16px;

    &--placeholder {
      color: var(--gray-500);
    }
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
:deep(.dp__main) {
  --dp-direction: "rtl";
}
</style>
