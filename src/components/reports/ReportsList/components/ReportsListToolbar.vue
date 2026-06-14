<template>
  <div class="reports-toolbar">
    <div class="reports-toolbar__search-wrapper">
      <div class="reports-toolbar__search-icon">
        <BaseIcon name="solar:magnifer-outline" width="20" height="20" />
      </div>
      <input
        v-model="searchQuery"
        type="text"
        class="reports-toolbar__search-input"
        :placeholder=" 'ابحث عن مزرعة...'"
        @input="handleSearch"
      />
      <transition name="fade">
        <button
          v-if="searchQuery"
          type="button"
          class="reports-toolbar__clear-btn"
          @click="clearSearch"
        >
          <BaseIcon name="solar:close-circle-bold" width="18" height="18" />
        </button>
      </transition>
    </div>

    <BaseButton @click="$emit('create')">
      <BaseIcon name="solar:add-circle-outline" width="20" height="20" />
      {{ t("reports.actions.create") }}
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseIcon from "@/components/shared/BaseIcon.vue";

const emit = defineEmits(["search", "create"]);
const { t } = useI18n();

const searchQuery = ref("");

const handleSearch = () => {
  emit("search", searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  emit("search", "");
};
</script>

<style lang="scss" scoped>
.reports-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--blue-100);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

  &__search-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 16px;
    height: 48px;
    border-radius: 14px;
    background: #f8fbff;
    border: 1.5px solid #e8eef6;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
      border-color: var(--blue-300);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
    }
  }

  &__search-icon {
    color: var(--slate-400);
    flex-shrink: 0;
    display: grid;
    place-items: center;
  }

  &__search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 1.35rem;
    font-weight: 500;
    color: var(--slate-800);
    font-family: inherit;

    &::placeholder {
      color: var(--slate-400);
      font-weight: 400;
    }
  }

  &__clear-btn {
    display: grid;
    place-items: center;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--slate-400);
    transition: color 0.2s;

    &:hover {
      color: var(--red-500);
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 576px) {
  .reports-toolbar {
    flex-direction: column;
    align-items: stretch;

    &__search-wrapper {
      height: 44px;
    }
  }
}
</style>
