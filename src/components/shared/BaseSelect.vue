<template>
  <div
    ref="triggerRef"
    :class="[
      'select',
      {
        'select--disabled': disabled,
        'select--readonly': readonly,
        'select--loading': loading,
      },
    ]"
  >
    <div
      :class="[
        'select__group',
        `select__group--${size}`,
        {
          'select__group--invalid': error,
          'select__group--open': isOpen,
          'select__group--disabled': disabled,
          'select__group--readonly': readonly,
        },
      ]"
    >
      <div
        class="select__control"
        role="combobox"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-disabled="disabled"
        :aria-readonly="readonly"
        :aria-labelledby="label ? `select-label-${uniqueId}` : undefined"
        :tabindex="disabled ? -1 : 0"
        @click="handleControlClick"
        @keydown="handleControlKeydown"
      >
        <div
          v-if="label"
          :id="`select-label-${uniqueId}`"
          :class="[
            'select__label',
            {
              'select__label--active': makeLabelActive,
            },
          ]"
        >
          {{ label }}
          <span v-if="required" class="select__required">*</span>
          <div v-if="tooltip" class="select__tooltip" v-tooltip="tooltip">
            <BaseIcon
              name="solar:info-circle-broken"
              :width="16"
              :height="16"
              color="var(--gray-700)"
            />
          </div>
        </div>
        <p v-if="!chosenItems.length" class="select__placeholder">
          {{ placeholder }}
        </p>
        <div class="select__wrapper">
          <div
            v-for="(item, index) in chosenItems"
            :key="item.id"
            :class="[
              'select__chosen',
              {
                'select__chosen--only': !multiple,
                'select__chosen--count':
                  countOfSelectedItems > maxTagCount && index === maxTagCount,
              },
            ]"
          >
            <slot name="selected-option" :option="item" :index="index">
              <div
                v-if="item.icon || item.img || item.emoji"
                class="select__icon"
              >
                <BaseIcon
                  v-if="item.icon"
                  :name="item.icon"
                  :width="16"
                  :height="16"
                  color="#5584FF"
                />
                <img v-if="item.img" :src="item.img" class="select__img" />
                <div v-if="item.emoji" class="select__emoji">
                  {{ item.emoji }}
                </div>
              </div>
              <div
                :class="['select__title', { 'select__title--only': !multiple }]"
              >
                {{ item.label }}
              </div>
            </slot>
            <div
              v-if="index < maxTagCount && multiple && !readonly && !disabled"
              class="select__remove"
              @click.stop="handleRemoveItem(item)"
            >
              <BaseIcon
                name="solar:close-circle-outline"
                :width="16"
                :height="16"
                color="var(--gray-700)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="select__loading">
        <div class="select__spinner"></div>
      </div>

      <!-- Clear Button -->
      <button
        v-if="
          clearable &&
          countOfSelectedItems > 0 &&
          !disabled &&
          !readonly &&
          !loading
        "
        type="button"
        class="select__clear"
        aria-label="Clear selection"
        @click.stop="handleClearSelection"
      >
        <BaseIcon
          name="solar:close-circle-outline"
          :width="20"
          :height="20"
          color="var(--gray-700)"
        />
      </button>

      <!-- Arrow -->
      <button
        type="button"
        class="select__toggle"
        :aria-label="isOpen ? 'Close dropdown' : 'Open dropdown'"
        :disabled="disabled || readonly"
        @click.stop="handleToggleClick"
      >
        <slot name="arrow" :toggle="toggle">
          <div :class="['select__arrow', { 'select__arrow--open': isOpen }]">
            <BaseIcon
              name="radix-icons:chevron-down"
              :width="16"
              :height="16"
              color="var(--gray-700)"
            />
          </div>
        </slot>
      </button>
    </div>

    <!-- Hidden input for form submission -->
    <input v-if="name" type="hidden" :name="name" :value="formValue" />

    <!-- Dropdown Menu -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          :style="positionStyle"
          :class="['select__items', `select__items--${direction}`]"
          role="listbox"
          :aria-multiselectable="multiple"
          :aria-label="label || 'Options'"
          @keydown="handleDropdownKeydown"
        >
          <div ref="listRef" class="select__list" @scroll="handleListScroll">
            <!-- Search Input -->
            <div v-if="search && flatOptions.length" class="select__search">
              <div
                v-if="multiple && filteredItems.length"
                :class="[
                  'select__check',
                  {
                    'select__check--selected': isAllItemsChecked,
                  },
                ]"
                role="checkbox"
                :aria-checked="isAllItemsChecked"
                tabindex="0"
                @click="handleSelectAllItems"
                @keydown.enter.space.prevent="handleSelectAllItems"
              >
                <div class="select__check-icon"></div>
              </div>
              <input
                ref="searchInputRef"
                v-model="selectSearchText"
                class="select__filter"
                type="text"
                :placeholder="searchPlaceholder"
                aria-label="Search options"
                @keydown="handleSearchKeydown"
              />
            </div>

            <!-- Empty State -->
            <template v-if="!flatOptions.length">
              <div class="select__empty">{{ emptyMessage }}</div>
            </template>
            <template v-else>
              <!-- Grouped Options -->
              <template v-if="hasGroups">
                <template v-for="group in filteredGroups" :key="group.label">
                  <div
                    v-if="group.options.length"
                    class="select__group-wrapper"
                  >
                    <div class="select__group-label">
                      {{ group.label }}
                    </div>
                    <div
                      v-for="item in group.options"
                      :key="item[trackBy]"
                      :class="getItemClasses(item)"
                      role="option"
                      :aria-selected="item.selected"
                      :aria-disabled="item.disabled"
                      :tabindex="item.disabled ? -1 : 0"
                      @click="handleSelectedItem(item)"
                      @keydown.enter.space.prevent="handleSelectedItem(item)"
                    >
                      <template v-if="showCheckbox">
                        <div
                          :class="[
                            'select__check',
                            {
                              'select__check--selected': item.selected,
                              'select__check--radio': !multiple,
                            },
                          ]"
                        >
                          <div class="select__check-icon"></div>
                        </div>
                      </template>
                      <slot
                        name="option"
                        :option="item"
                        :selected="item.selected"
                      >
                        <div
                          v-if="item.icon || item.img || item.emoji"
                          class="select__icon"
                        >
                          <BaseIcon
                            v-if="item.icon"
                            :name="item.icon"
                            :width="16"
                            :height="16"
                            color="#5584FF"
                          />
                          <img
                            v-if="item.img"
                            :src="item.img"
                            class="select__img"
                          />
                          <div v-if="item.emoji" class="select__emoji">
                            {{ item.emoji }}
                          </div>
                        </div>
                        <div class="select__content">
                          <div class="select__info">{{ item.label }}</div>
                          <p
                            v-if="item.description"
                            class="select__description"
                          >
                            {{ item.description }}
                          </p>
                        </div>
                      </slot>
                    </div>
                  </div>
                </template>
              </template>

              <!-- Flat Options -->
              <template v-else-if="filteredItems.length">
                <div
                  v-for="(item, index) in filteredItems"
                  :key="item[trackBy]"
                  :ref="(el) => setItemRef(el, index)"
                  :class="getItemClasses(item, index)"
                  role="option"
                  :aria-selected="item.selected"
                  :aria-disabled="item.disabled"
                  :tabindex="item.disabled ? -1 : 0"
                  @click="handleSelectedItem(item)"
                  @keydown.enter.space.prevent="handleSelectedItem(item)"
                >
                  <template v-if="showCheckbox">
                    <div
                      :class="[
                        'select__check',
                        {
                          'select__check--selected': item.selected,
                          'select__check--radio': !multiple,
                        },
                      ]"
                    >
                      <div class="select__check-icon"></div>
                    </div>
                  </template>
                  <slot name="option" :option="item" :selected="item.selected">
                    <div
                      v-if="item.icon || item.img || item.emoji"
                      class="select__icon"
                    >
                      <BaseIcon
                        v-if="item.icon"
                        :name="item.icon"
                        :width="16"
                        :height="16"
                        color="#5584FF"
                      />
                      <img
                        v-if="item.img"
                        :src="item.img"
                        class="select__img"
                      />
                      <div v-if="item.emoji" class="select__emoji">
                        {{ item.emoji }}
                      </div>
                    </div>
                    <div class="select__content">
                      <div class="select__info">{{ item.label }}</div>
                      <p v-if="item.description" class="select__description">
                        {{ item.description }}
                      </p>
                    </div>
                  </slot>
                </div>
              </template>

              <!-- No Results -->
              <template v-else>
                <div class="select__item select__item--empty">
                  <div class="select__icon">
                    <BaseIcon
                      name="solar:magnifer-outline"
                      :width="24"
                      :height="24"
                      color="#6b7280"
                    />
                  </div>
                  <div class="select__info">
                    No results found for "{{ selectSearchText }}"
                  </div>
                </div>
              </template>
            </template>

            <!-- Loading More Indicator -->
            <div
              v-if="infiniteScroll && loadingMore"
              class="select__loading-more"
            >
              <div class="select__spinner select__spinner--small"></div>
              <span>Loading more...</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Errors -->
    <div v-if="error" class="select__errors" role="alert" aria-live="polite">
      <slot name="errors">
        <div class="select__error">
          {{ errorText }}
        </div>
      </slot>
    </div>

    <!-- Hints -->
    <div v-if="hint || $slots.hint" class="select__helpers">
      <slot name="hint">
        <p v-if="hint" class="select__hint">
          {{ hint }}
        </p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useDropdown } from "@/composables/UseDropdownOptions";

// Generate unique ID for accessibility
const uniqueId = Math.random().toString(36).substring(2, 9);

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  search: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: "Select an option",
  },
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
  trackBy: {
    type: String,
    default: "id",
  },
  modelValue: {
    type: [Object, Array, String, Number],
    default: null,
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorText: {
    type: String,
    required: false,
    default: "",
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
  emptyMessage: {
    type: String,
    default: "No options available",
  },
  hint: {
    type: String,
    required: false,
    default: "",
  },
  showCheckbox: {
    type: Boolean,
    default: false,
  },
  returnObject: {
    type: Boolean,
    default: false,
  },
  disabledValues: {
    type: Array,
    default: () => [],
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    default: "auto",
  },
  // New props
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: "",
  },
  maxTagCount: {
    type: Number,
    default: 2,
  },
  minSelected: {
    type: Number,
    default: null,
  },
  maxSelected: {
    type: Number,
    default: null,
  },
  grouped: {
    type: Boolean,
    default: false,
  },
  // Infinite scroll props
  infiniteScroll: {
    type: Boolean,
    default: false,
  },
  loadingMore: {
    type: Boolean,
    default: false,
  },
  scrollThreshold: {
    type: Number,
    default: 50, // pixels from bottom to trigger
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
  tooltip: {
    type: String,
    default: "",
    required: false,
  },
  size: {
    type: String,
    default: "md",
    required: false,
    validator: (value) => {
      return ["sm", "md", "lg"].includes(value);
    },
  },
});

const emit = defineEmits([
  "update:modelValue",
  "open",
  "close",
  "search",
  "blur",
  "scroll-end",
]);

// Refs
const triggerRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const listRef = ref(null);
const items = ref([]);
const selectedItems = ref([]);
const selectSearchText = ref("");
const focusedIndex = ref(-1);
const itemRefs = ref([]);
const isScrollEndEmitted = ref(false);

// Use dropdown composable
const { isOpen, direction, positionStyle, open, close, toggle } = useDropdown(
  triggerRef,
  dropdownRef,
  {
    position: props.position,
    offset: 8,
    closeOnClickOutside: true,
    closeOnEscape: true,
  },
);

// Computed: Check if options are grouped
const hasGroups = computed(() => {
  return (
    // props.grouped || props.options.some((opt) => Array.isArray(opt.options))
    props.grouped
  );
});

// Computed: Flatten grouped options for internal use
const flatOptions = computed(() => {
  if (hasGroups.value) {
    return props.options.flatMap((group) => group.options || []);
  }
  return props.options;
});

// Computed
const countOfSelectedItems = computed(() => selectedItems.value.length);

const makeLabelActive = computed(
  () => isOpen.value || countOfSelectedItems.value > 0,
);

const isAllItemsChecked = computed(() => {
  const enabledItems = items.value.filter((item) => !item.disabled);
  return enabledItems.length && enabledItems.every((item) => item.selected);
});

const chosenItems = computed(() => {
  if (props.multiple) {
    const selectedList = selectedItems.value;
    if (selectedList.length <= props.maxTagCount) {
      return selectedItems.value;
    } else {
      return selectedList.slice(0, props.maxTagCount).concat({
        id: "more",
        label: `+ ${selectedList.length - props.maxTagCount}`,
      });
    }
  } else {
    return selectedItems.value;
  }
});

const retrieveSelectedItems = computed(() => {
  const itemsWithoutSelected = selectedItems.value.map((item) => {
    const { selected, ...rest } = item;
    return rest;
  });
  if (itemsWithoutSelected.length) {
    if (props.returnObject) {
      return props.multiple ? itemsWithoutSelected : itemsWithoutSelected[0];
    } else {
      return props.multiple
        ? itemsWithoutSelected.map((item) => item[props.trackBy])
        : itemsWithoutSelected[0][props.trackBy];
    }
  } else {
    return null;
  }
});

const filteredItems = computed(() => {
  const query = selectSearchText.value.trim().toLowerCase();
  if (!query) {
    return items.value;
  } else {
    return items.value.filter((item) => {
      const label = item.label.toLowerCase();
      return label.includes(query);
    });
  }
});

// Computed: Filtered groups for grouped options
const filteredGroups = computed(() => {
  if (!hasGroups.value) return [];

  const query = selectSearchText.value.trim().toLowerCase();

  return props.options.map((group) => {
    const groupItems = (group.options || []).map((opt) => {
      const internalItem = items.value.find(
        (i) => i[props.trackBy] === opt[props.trackBy],
      );
      return internalItem || opt;
    });

    const filteredOptions = query
      ? groupItems.filter((item) => item.label.toLowerCase().includes(query))
      : groupItems;

    return {
      ...group,
      options: filteredOptions,
    };
  });
});

// Form value for hidden input
const formValue = computed(() => {
  if (props.multiple) {
    return selectedItems.value.map((i) => i[props.trackBy]).join(",");
  }
  return selectedItems.value[0]?.[props.trackBy] || "";
});

// Can select more (for max limit)
const canSelectMore = computed(() => {
  if (props.maxSelected === null) return true;
  return countOfSelectedItems.value < props.maxSelected;
});

// Can deselect (for min limit)
const canDeselect = computed(() => {
  if (props.minSelected === null) return true;
  return countOfSelectedItems.value > props.minSelected;
});

// Methods
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el;
  }
};

const getItemClasses = (item, index) => {
  return [
    "select__item",
    {
      "select__item--selected": item.selected,
      "select__item--disabled": item.disabled,
      "select__item--focused": index === focusedIndex.value,
    },
  ];
};

const handleControlClick = () => {
  if (props.disabled || props.readonly) return;
  toggle();
};

const handleToggleClick = () => {
  if (props.disabled || props.readonly) return;
  toggle();
};

const handleControlKeydown = (event) => {
  if (props.disabled || props.readonly) return;

  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      if (!isOpen.value) {
        open();
      }
      break;
    case "ArrowDown":
      event.preventDefault();
      if (!isOpen.value) {
        open();
      } else {
        focusNextItem();
      }
      break;
    case "ArrowUp":
      event.preventDefault();
      if (!isOpen.value) {
        open();
      } else {
        focusPreviousItem();
      }
      break;
    case "Escape":
      if (isOpen.value) {
        close();
      }
      break;
  }
};

const handleDropdownKeydown = (event) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusNextItem();
      break;
    case "ArrowUp":
      event.preventDefault();
      focusPreviousItem();
      break;
    case "Home":
      event.preventDefault();
      focusFirstItem();
      break;
    case "End":
      event.preventDefault();
      focusLastItem();
      break;
    case "Escape":
      close();
      triggerRef.value?.focus();
      break;
  }
};

const handleSearchKeydown = (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    focusFirstItem();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    focusLastItem();
  }
};

const focusNextItem = () => {
  const enabledItems = filteredItems.value.filter((i) => !i.disabled);
  if (!enabledItems.length) return;

  const currentIdx = focusedIndex.value;
  let nextIdx = currentIdx + 1;

  while (
    nextIdx < filteredItems.value.length &&
    filteredItems.value[nextIdx]?.disabled
  ) {
    nextIdx++;
  }

  if (nextIdx >= filteredItems.value.length) {
    nextIdx = filteredItems.value.findIndex((i) => !i.disabled);
  }

  focusedIndex.value = nextIdx;
  itemRefs.value[nextIdx]?.focus();
};

const focusPreviousItem = () => {
  const enabledItems = filteredItems.value.filter((i) => !i.disabled);
  if (!enabledItems.length) return;

  const currentIdx = focusedIndex.value;
  let prevIdx = currentIdx - 1;

  while (prevIdx >= 0 && filteredItems.value[prevIdx]?.disabled) {
    prevIdx--;
  }

  if (prevIdx < 0) {
    // Find last enabled item
    for (let i = filteredItems.value.length - 1; i >= 0; i--) {
      if (!filteredItems.value[i].disabled) {
        prevIdx = i;
        break;
      }
    }
  }

  focusedIndex.value = prevIdx;
  itemRefs.value[prevIdx]?.focus();
};

const focusFirstItem = () => {
  const firstIdx = filteredItems.value.findIndex((i) => !i.disabled);
  if (firstIdx !== -1) {
    focusedIndex.value = firstIdx;
    itemRefs.value[firstIdx]?.focus();
  }
};

const focusLastItem = () => {
  for (let i = filteredItems.value.length - 1; i >= 0; i--) {
    if (!filteredItems.value[i].disabled) {
      focusedIndex.value = i;
      itemRefs.value[i]?.focus();
      break;
    }
  }
};

const handleSelectedItem = (clickedItem) => {
  if (props.disabled || props.readonly) return;

  const chosenItem = items.value.find(
    (item) => item[props.trackBy] === clickedItem[props.trackBy],
  );
  if (!chosenItem || chosenItem.disabled) return;

  if (props.multiple) {
    if (chosenItem.selected) {
      // Check min limit
      if (!canDeselect.value) return;

      chosenItem.selected = false;
      selectedItems.value = selectedItems.value.filter(
        (item) => item[props.trackBy] !== clickedItem[props.trackBy],
      );
    } else {
      // Check max limit
      if (!canSelectMore.value) return;

      chosenItem.selected = true;
      selectedItems.value.push(chosenItem);
    }
  } else {
    if (chosenItem.selected) {
      return;
    } else {
      items.value.forEach((item) => (item.selected = false));
      chosenItem.selected = true;
      selectedItems.value = [chosenItem];
    }
  }

  emit("update:modelValue", retrieveSelectedItems.value);
  if (props.closeOnSelect) {
    close();
  }
};

const handleSelectAllItems = () => {
  if (props.disabled || props.readonly) return;

  const isChecked = !isAllItemsChecked.value;

  // Check max limit when selecting all
  if (isChecked && props.maxSelected !== null) {
    const enabledItems = items.value.filter((item) => !item.disabled);
    if (enabledItems.length > props.maxSelected) {
      // Select only up to max
      let count = 0;
      items.value.forEach((item) => {
        if (!item.disabled && count < props.maxSelected) {
          item.selected = true;
          count++;
        }
      });
    } else {
      items.value.forEach((item) => {
        if (!item.disabled) {
          item.selected = true;
        }
      });
    }
  } else {
    items.value.forEach((item) => {
      if (!item.disabled) {
        item.selected = isChecked;
      }
    });
  }

  selectedItems.value = items.value.filter((item) => item.selected);
  emit("update:modelValue", retrieveSelectedItems.value);
};

const handleRemoveItem = (removedItem) => {
  if (props.disabled || props.readonly) return;

  // Check min limit
  if (!canDeselect.value) return;

  const clickedItem = items.value.find(
    (item) => item[props.trackBy] === removedItem[props.trackBy],
  );

  // Null check to prevent runtime errors
  if (!clickedItem) return;

  clickedItem.selected = false;

  selectedItems.value = selectedItems.value.filter(
    (item) => item[props.trackBy] !== removedItem[props.trackBy],
  );

  emit("update:modelValue", retrieveSelectedItems.value);
};

const handleClearSelection = () => {
  if (props.disabled || props.readonly) return;

  items.value.forEach((item) => {
    item.selected = false;
  });
  selectedItems.value = [];
  emit("update:modelValue", null);
};

// Infinite scroll handler
const handleListScroll = (event) => {
  if (!props.infiniteScroll || !props.hasMore || props.loadingMore) return;

  const target = event.target;
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;

  // Check if scrolled near the bottom
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

  if (distanceFromBottom <= props.scrollThreshold) {
    if (!isScrollEndEmitted.value) {
      isScrollEndEmitted.value = true;
      emit("scroll-end");
    }
  } else {
    // Reset when scrolled away from bottom
    isScrollEndEmitted.value = false;
  }
};

// Initialize items from options (supports grouped and flat)
const initializeItems = () => {
  const optionsToProcess = hasGroups.value ? flatOptions.value : props.options;
  items.value = optionsToProcess.map((item) => ({
    ...item,
    selected: false,
    disabled:
      item.disabled || props.disabledValues.includes(item[props.trackBy]),
  }));
};

// Sync selected items with modelValue
const syncSelectedItems = () => {
  items.value.forEach((item) => {
    item.selected = false;
    if (props.modelValue !== null && props.modelValue !== undefined) {
      if (Array.isArray(props.modelValue)) {
        if (props.modelValue.includes(item[props.trackBy])) {
          item.selected = true;
        }
      } else if (
        typeof props.modelValue === "object" &&
        props.modelValue !== null
      ) {
        if (item[props.trackBy] === props.modelValue[props.trackBy]) {
          item.selected = true;
        }
      } else {
        if (item[props.trackBy] === props.modelValue) {
          item.selected = true;
        }
      }
    }
  });
  selectedItems.value = items.value.filter((item) => item.selected);
};

// Watchers
watch(
  () => props.modelValue,
  () => {
    syncSelectedItems();
  },
);

watch(
  () => [props.options, props.disabledValues],
  () => {
    initializeItems();
    syncSelectedItems();
  },
);

watch(isOpen, async (newVal) => {
  if (newVal) {
    emit("open");
    focusedIndex.value = -1;
    isScrollEndEmitted.value = false; // Reset scroll-end flag when opening
    // Auto-focus search input when dropdown opens
    await nextTick();
    if (props.search && searchInputRef.value) {
      searchInputRef.value.focus();
    }
  } else {
    emit("close");
    selectSearchText.value = "";
    emit("blur");
  }
});

watch(selectSearchText, (newVal) => {
  emit("search", newVal);
});

// Lifecycle
onMounted(() => {
  initializeItems();
  syncSelectedItems();
});
</script>

<style lang="scss" scoped>
.select {
  position: relative;

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--readonly {
    .select__control {
      cursor: default;
    }

    .select__toggle {
      cursor: default;
    }
  }

  &__group {
    height: 50px;
    border-radius: var(--border-radius-lg);
    display: flex;
    align-items: center;
    border: 1px solid var(--gray-300);
    background-color: var(--white);
    cursor: pointer;
    transition: all 300ms ease-in-out;
    position: relative;

    &--invalid {
      border-color: var(--red-500);
    }

    &--open,
    &:focus-within {
      border-color: var(--blue-500);
      box-shadow: 0 0 0 4px var(--blue-50);
      // box-shadow: 0 0 0 2px var(--blue-100);
    }

    &--disabled {
      background-color: var(--gray-100);
      cursor: not-allowed;
    }

    &--readonly {
      background-color: var(--gray-50);
      cursor: default;
    }
    // Size
    &--sm {
      height: 40px;
    }
    &--md {
      height: 50px;
    }
    &--lg {
      height: 60px;
    }
  }

  &__label {
    font-size: 1.2rem;
    color: var(--blue-600);
    background-color: var(--white);
    padding: 2px 8px;
    position: absolute;
    top: 0;
    inset-inline-start: 12px;
    z-index: 20;
    transform: translateY(-50%);
    border-radius: 4px;
    pointer-events: none;
    display: flex;
    align-items: center;

    &--invalid {
      color: var(--red-500);
    }
  }

  &__required {
    color: var(--red-500);
    margin-inline-start: 2px;
  }
  &__tooltip {
    cursor: pointer;
    margin-inline-start: 8px;
    pointer-events: auto;
  }

  &__placeholder {
    font-size: 1.4rem;
    color: var(--gray-400);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-start: 16px;
    pointer-events: none;
  }

  &__control {
    flex-grow: 1;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    outline: none;

    &:focus {
      outline: none;
    }
  }

  &__wrapper {
    width: 100%;
    padding-inline-start: 12px;
    border-radius: var(--border-radius-lg);
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
  }

  &__chosen {
    display: flex;
    align-items: center;
    background-color: var(--gray-100);
    border: 1px solid var(--gray-200);
    padding: 4px 8px;
    border-radius: var(--border-radius-sm);
    transition: background-color 200ms;

    &:hover {
      background-color: var(--gray-200);
    }

    &--only {
      background-color: transparent;
      border: none;
      padding: 0;

      &:hover {
        background-color: transparent;
      }
    }
  }

  &__title {
    font-size: 1.4rem;
    color: var(--gray-900);
    max-width: 14ch;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin-inline-end: 6px;

    &--only {
      max-width: none;
      color: var(--gray-900);
    }
  }

  &__remove {
    line-height: 0;
    cursor: pointer;
    color: var(--gray-400);
    transition: color 200ms;

    &:hover {
      color: var(--red-500);
    }
  }

  &__loading {
    position: absolute;
    top: 50%;
    inset-inline-end: 44px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid var(--gray-200);
    border-top-color: var(--blue-500);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    &--small {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }
  }

  &__loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    font-size: 1.2rem;
    color: var(--gray-500);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__clear {
    cursor: pointer;
    position: absolute;
    top: 50%;
    inset-inline-end: 44px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0;
  }

  &__toggle {
    cursor: pointer;
    position: absolute;
    top: 50%;
    inset-inline-end: 12px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
    transition: color 300ms ease-in-out;
    background: none;
    border: none;
    padding: 0;

    &:hover:not(:disabled) {
      color: var(--gray-600);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__arrow {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(0deg);
    transition: transform 300ms ease-in-out;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__items {
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-lg);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    z-index: 9999;
    // margin-top: 4px;

    &--up {
      transform-origin: bottom;
      // margin-bottom: 4px;
      // margin-top: 0;
    }

    &--down {
      transform-origin: top;
    }
  }

  &__list {
    background-color: var(--white);
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    padding: 4px;
  }

  &__group-wrapper {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__group-label {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-500);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 8px 12px 4px;
    position: sticky;
    top: 0;
    background-color: var(--white);
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    position: relative;
    border-radius: var(--border-radius-md);
    transition: all 300ms ease-in-out;
    margin-bottom: 2px;
    color: var(--gray-700);
    outline: none;

    &--selected {
      background-color: var(--blue-50);
      color: var(--blue-700);
    }

    &:hover:not(&--disabled),
    &--focused {
      background-color: var(--gray-50);
      color: var(--gray-900);
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:focus {
      background-color: var(--gray-50);
      // outline: 1px solid var(--blue-500);
      // outline-offset: -1px;
    }
  }

  &__check {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid var(--gray-300);
    margin-inline-end: 12px;
    position: relative;
    transition: all 200ms ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: "";
      width: 10px;
      height: 10px;
      background-color: white;
      transform: scale(0);
      transition: transform 200ms ease;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
      mask-size: contain;
      mask-repeat: no-repeat;
      mask-position: center;
      background-color: white;
    }

    &--radio {
      border-radius: 50%;

      &::before {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        mask-image: none;
        background-color: white;
      }
    }

    &--selected {
      background-color: var(--blue-600);
      border-color: var(--blue-600);

      &::before {
        transform: scale(1);
      }
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-inline-end: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__img {
    width: 24px;
    height: 24px;
  }
  &__emoji {
    font-size: 1.8rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__info {
    font-size: 1.4rem;
    font-weight: 500;
  }

  &__description {
    font-size: 1.2rem;
    color: var(--gray-500);
    margin-block-start: 2px;
  }

  &__search {
    padding: 8px;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: var(--white);
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 4px;
  }

  &__filter {
    width: 100%;
    border-radius: var(--border-radius-md);
    padding: 8px 12px;
    font-size: 1.4rem;
    color: var(--gray-900);
    border: 1px solid var(--gray-300);
    background-color: var(--gray-50);
    transition: border-color 200ms;

    &:focus {
      border-color: var(--blue-500);
      background-color: var(--white);
      outline: none;
    }

    &::placeholder {
      color: var(--gray-400);
    }
  }

  &__empty {
    font-size: 1.3rem;
    color: var(--gray-500);
    padding: 16px;
    text-align: center;
  }

  &__errors {
    margin-block-start: 6px;
  }

  &__error {
    font-size: 1.2rem;
    color: var(--red-500);
  }

  &__helpers {
    margin-block-start: 6px;
  }

  &__hint {
    font-size: 1.2rem;
    color: var(--gray-500);
  }
}

// Dropdown transition animations
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}
</style>
