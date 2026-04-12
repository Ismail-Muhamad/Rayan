<template>
  <div class="search">
    <div class="search__icon">
      <BaseIcon
        name="si:search-line"
        color="var(--gray-700)"
        :width="20"
        :height="20"
      />
    </div>
    <input
      v-model="inputValue"
      type="text"
      class="search__input"
      :placeholder="placeholder || t('GLOBAL.TABLE.SEARCH')"
      @input="handleInput"
    />
    <div
      :class="['search__clear', { 'search__clear--active': !!inputValue }]"
      @click="handleClearSearch"
    >
      <BaseIcon name="qlementine-icons:clear-24" color="var(--gray-700)" />
    </div>
  </div>
</template>

<script setup>
import { watch, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    default: () => "",
  },
});
const { modelValue, placeholder } = toRefs(props);
const emit = defineEmits(["update:modelValue"]);
const inputValue = ref(null);
const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};
const handleClearSearch = () => {
  inputValue.value = "";
  emit("update:modelValue", "");
};
</script>

<style lang="scss" scoped>
.search {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding-inline: 4px;
  overflow: hidden;
  background-color: var(--white);
  border: 1px solid var(--gray-300);

  &__input {
    height: 40px;
    padding: 8px 16px;
    font-size: 1.4rem;
    color: var(--gray-900);

    &::placeholder {
      color: var(--gray-400);
      font-size: 1.2rem;
    }
  }

  &__icon,
  &__clear {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    background-color: var(--gray-50);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 0;
  }

  &__clear {
    position: relative;
    inset-inline-start: 100%;
    margin-inline-start: auto;
    opacity: 0;
    transition: opacity 300ms ease-in-out, inset-inline-start 300ms ease-in-out;

    &--active {
      opacity: 1;
      inset-inline-start: 0;
    }
  }
}
</style>
