<template>
  <div
    :class="[
      'chatbot',
      {
        'chatbot--default': variant === 'default',
      },
    ]"
  >
    <div v-if="showToolbar" class="chatbot__info">
      <slot v-if="$slots.heading" name="heading"></slot>
      <div v-if="title" class="chatbot__title">
        {{ title }}
      </div>
      <div
        v-if="searchPlace === 'start' && !hideSearch"
        class="chatbot__search"
      >
        <BaseSearchInput
          v-model="searchTerm"
          :placeholder="searchPlaceholder"
          @update:model-value="handleTableSearch"
        />
      </div>
      <!-- <div
        v-if="$slots.search && searchPlace === 'start' && !hideSearch"
        class="chatbot__search"
      >
        <slot name="search"></slot>
      </div> -->
      <div class="chatbot__buttons">
        <div
          :class="[
            'chatbot__button',
            { 'chatbot__button--order': buttonsOrder },
          ]"
        >
          <slot name="buttons"></slot>
        </div>
        <!-- <BaseButton size="sm" @click="handleCustomExport('excel')">
          {{ $t("GLOBAL.DOWNLOAD.EXCEL") }}
        </BaseButton> -->
        <!-- Customize Columns -->
        <!-- v-if="$slots.search && searchPlace === 'end' && !hideSearch" -->
        <div
          v-if="searchPlace === 'end' && !hideSearch"
          class="chatbot__search"
        >
          <!-- <slot name="search"></slot> -->
          <BaseSearchInput
            v-model="searchTerm"
            :placeholder="searchPlaceholder"
            @update:model-value="handleTableSearch"
          />
        </div>
      </div>
    </div>
    <div v-if="$slots.row" class="chatbot__row">
      <slot name="row"></slot>
    </div>
    <div
      :class="[
        'chatbot__content',
        {
          'chatbot__content--default': variant === 'default',
        },
      ]"
    >
      <div
        ref="tableWrapper"
        :class="[
          'chatbot__wrapper',
          {
            'chatbot__wrapper--loading': isLoading,
          },
        ]"
      >
        <table v-if="!isLoading && !$slots.loading" class="chatbot__table">
          <colgroup class="chatbot__colgroup">
            <col
              v-for="header in tableHeaders"
              :key="header.key"
              class="chatbot__col"
            />
          </colgroup>
          <thead class="chatbot__thead">
            <tr class="chatbot__tr">
              <template
                v-for="(header, index) in tableHeaders"
                :key="header.key"
              >
                <th
                  :class="[
                    'chatbot__th',
                    {
                      'chatbot__th--sticky': header.fixed,
                      'chatbot__th--border': bordered,
                      'chatbot__th--last chatbot__th--last-sticky':
                        isLastFixedTableHeaderCell(index) && isScrolling,
                    },
                  ]"
                  :style="{
                    ...getTableHeaderCellStyle(index),
                    textAlign: header.alignment || 'auto',
                  }"
                >
                  <!-- Check if the slot exists and render it if true, otherwise display header.text -->
                  <template v-if="$slots[`header-${header.value}`]">
                    <slot
                      :name="`header-${header.value}`"
                      :item="header"
                      :index="index"
                    ></slot>
                  </template>
                  <template v-else>
                    <div
                      :class="[
                        'chatbot__th-content',
                        `chatbot__th-content--${header.alignment || 'left'}`,
                      ]"
                    >
                      {{ header.text }}
                      <button
                        v-if="header.sortable"
                        class="chatbot__sort"
                        @click="handleSortBy(header.value)"
                      >
                        <BaseIcon
                          name="solar:transfer-vertical-outline"
                          :width="16"
                          :height="16"
                          color="var(--gray-700)"
                        />
                      </button>
                    </div>
                  </template>
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="chatbot__tbody">
            <tr v-for="item in items" :key="item.id" class="chatbot__tr">
              <td
                v-for="(header, index) in tableHeaders"
                :key="header.key"
                :class="[
                  'chatbot__td',
                  {
                    'chatbot__td--sticky': header.fixed,
                    'chatbot__td--center': header.alignment === 'center',
                    'chatbot__td--border': bordered,
                    'chatbot__td--last chatbot__td--last-sticky':
                      isLastFixedTableHeaderCell(index) && isScrolling,
                  },
                ]"
                :style="getTableHeaderCellStyle(index)"
              >
                <!-- Check if the slot exists and render it if true, otherwise display item[header.value] -->
                <template v-if="$slots[header.value]">
                  <slot :name="header.value" :item="item" :index="index"></slot>
                </template>
                <template v-else>
                  <div
                    :class="[
                      'chatbot__td-content',
                      `chatbot__td-content--${header.alignment || 'left'}`,
                    ]"
                  >
                    <span>
                      {{ item[header.value] ? item[header.value] : "N/A" }}
                    </span>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Loading -->
        <div
          v-if="isLoading"
          :class="[
            'chatbot__loading',
            {
              'chatbot__loading--active': isLoading && !$slots.loading,
            },
          ]"
        >
          <slot v-if="$slots.loading" name="loading"></slot>
        </div>
        <!-- Empty -->
        <div v-if="!isLoading && !items.length" class="chatbot__empty">
          <!-- || $slots.empty" -->
          <slot v-if="$slots.initial && !searchTerm" name="initial"></slot>
          <span v-else class="chatbot__message">
            {{ $t("GLOBAL.TABLE.EMPTY") }}
          </span>
        </div>
      </div>
    </div>
    <!-- Pagination -->
    <div
      v-if="items.length && (pagination || $slots.pagination)"
      class="chatbot__pagination"
    >
      <slot v-if="$slots.pagination" name="pagination"></slot>
      <BasePagination v-else :meta="meta" @page-change="handlePageChange" />
    </div>
  </div>
</template>

<script>
import {
  loadCustomHeaders,
  saveCustomHeaders,
} from "@/helpers/customizeTableHeaders";
import { exportToPDF, exportToCSV, exportToExcel } from "@/helpers/download";
import BasePagination from "./BasePagination.vue";
export default {
  name: "ErabyTable",
  components: {
    BasePagination,
  },
  props: {
    title: {
      type: String,
      required: false,
    },
    titleIcon: {
      type: String,
      required: false,
    },
    headers: {
      type: Array,
      required: true,
      validator: (value) => value.length > 0,
    },
    items: {
      type: Array,
      required: true,
      validator: (value) => value.length === 0 || value.length > 0,
    },
    pagination: {
      type: Boolean,
      default: false,
    },
    meta: {
      type: Object,
      default: () => {},
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    hideSearch: {
      type: Boolean,
      default: false,
    },
    searchPlace: {
      type: String,
      default: "start",
    },
    downloadPdf: {
      type: Boolean,
      default: false,
    },
    downloadCsv: {
      type: Boolean,
      default: false,
    },
    downloadExcel: {
      type: Boolean,
      default: false,
    },
    buttonsOrder: {
      type: Number,
      default: 0,
    },
    buttonsPlace: {
      type: String,
      default: "end",
    },
    // UI
    bordered: {
      type: Boolean,
      default: false,
    },
    // Table Id for customization headers
    tableId: {
      type: String,
      required: false,
      default: null,
    },
    searchPlaceholder: {
      type: String,
      default: "بحث ...",
    },
    rowActions: {
      type: Object,
      default: () => ({ edit: true, duplicate: true, delete: true }),
      validator: (value) => {
        // Ensure value is an object
        if (typeof value !== "object" || value === null) {
          return false;
        }
        // Validate that if properties exist, they are booleans
        const validKeys = ["edit", "duplicate", "delete"];
        for (const key in value) {
          // Ensure no extra keys
          if (!validKeys.includes(key)) {
            return false;
          }
          // Ensure all provided values are boolean
          if (typeof value[key] !== "boolean") {
            return false;
          }
        }
        return true;
      },
    },
    showRowActions: {
      type: Boolean,
      default: true,
    },
    rowActions: {
      type: Object,
      default: () => ({ edit: true, duplicate: true, delete: true }),
      validator: (value) => {
        // Ensure value is an object
        if (typeof value !== "object" || value === null) {
          return false;
        }
        // Validate that if properties exist, they are booleans
        const validKeys = ["edit", "duplicate", "delete"];
        for (const key in value) {
          // Ensure no extra keys
          if (!validKeys.includes(key)) {
            return false;
          }
          // Ensure all provided values are boolean
          if (typeof value[key] !== "boolean") {
            return false;
          }
        }
        return true;
      },
    },
    showEditAction: {
      type: Boolean,
      default: true,
    },
    showDuplicateAction: {
      type: Boolean,
      default: true,
    },
    showDeleteAction: {
      type: Boolean,
      default: true,
    },
    allowCustomizeColumns: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: "full",
      validator: (value) => ["full", "default"].includes(value),
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
  },
  emits: [
    "onPageChange",
    "onSearch",
    "onEditRow",
    "onDuplicateRow",
    "onDeleteRow",
  ],
  data() {
    return {
      mappedHeaders: [],
      mappedVisibleHeaders: [],
      isScrolling: false,
      sortKey: null,
      sortOrder: "desc", // 'asc' for ascending, 'desc' for descending,
      showCustomizeHeadersModal: false,
      searchTerm: "",
      exportOptions: [
        {
          label: this.$t("GLOBAL.DOWNLOAD.CSV"),
          value: "csv",
          icon: "hugeicons:csv-01",
          onClick: this.handleDownloadCSV,
        },
        {
          label: this.$t("GLOBAL.DOWNLOAD.EXCEL"),
          value: "excel",
          icon: "hugeicons:google-sheet",
          onClick: this.handleDownloadExcel,
        },
        {
          label: this.$t("GLOBAL.DOWNLOAD.PDF"),
          value: "pdf",
          icon: "hugeicons:pdf-01",
          onClick: this.handleDownloadPDF,
        },
      ],
      rowActionsInfo: [
        {
          key: "edit",
          label: this.$t("GLOBAL.ACTIONS.EDIT"),
          icon: "mynaui:edit-one",
          color: "blue",
          variant: "outline",
        },
        {
          key: "duplicate",
          label: this.$t("GLOBAL.ACTIONS.DUPLICATE"),
          icon: "famicons:duplicate-outline",
          color: "green",
          variant: "outline",
        },
        {
          key: "delete",
          label: this.$t("GLOBAL.ACTIONS.DELETE"),
          icon: "weui:delete-on-outlined",
          color: "red",
          variant: "outline",
        },
      ],
    };
  },
  computed: {
    // mappedVisibleHeaders() {
    //   return this.mappedHeaders.filter((header) => header.isVisible);
    // },
    rowActionsList() {
      return this.rowActionsInfo.filter(
        (action) => this.rowActions[action.key],
      );
    },
    tableHeaders() {
      return (this.headers || []).map((header) => ({
        ...header,
        width: header.width || "auto",
      }));
    },
    mappedItems() {
      const items = [...this.items];

      if (!this.sortKey) return items;

      return items.sort((a, b) => {
        const res = a[this.sortKey] > b[this.sortKey] ? 1 : -1;
        return this.sortOrder === "asc" ? res : -res;
      });
    },
  },
  mounted() {
    this.$refs.tableWrapper.addEventListener("scroll", this.handleTableScroll);
  },
  beforeUnmount() {
    this.$refs.tableWrapper.removeEventListener(
      "scroll",
      this.handleTableScroll,
    );
  },
  methods: {
    getTableHeaderCellStyle(index) {
      const coordinates = {
        "inset-inline-start": 0,
      };
      for (let i = 0; i < index; i++) {
        if (this.tableHeaders[i].fixed) {
          coordinates["inset-inline-start"] += this.tableHeaders[i].width || 0;
        }
      }
      return {
        minWidth: this.tableHeaders[index]?.width
          ? `${this.tableHeaders[index].width}px`
          : "auto",
        width: this.tableHeaders[index]?.width
          ? `${this.tableHeaders[index].width}px`
          : "auto",
        "inset-inline-start": this.tableHeaders[index]?.fixed
          ? `${coordinates["inset-inline-start"]}px`
          : "auto",
      };
    },
    isLastFixedTableHeaderCell(index) {
      const lastFixedIndex = this.tableHeaders.findLastIndex(
        (header) => header.fixed,
      );
      return index === lastFixedIndex;
    },

    handlePageChange(page) {
      this.$emit("onPageChange", page);
    },
    // Sort Operation
    handleSortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortOrder = "desc";
      }
      //this.handleSortItems();
    },
    handleSortItems() {
      if (this.sortKey) {
        this.mappedItems.sort((a, b) => {
          let result = 0;
          if (a[this.sortKey] > b[this.sortKey]) result = 1;
          else if (a[this.sortKey] < b[this.sortKey]) result = -1;

          return this.sortOrder === "asc" ? result : -result;
        });
      }
    },
    // handleTableScroll() {
    //   // Check if the table is being scrolled
    //   let scrollLeft = this.$refs.tableWrapper.scrollLeft;
    //   const maxScrollLeft =
    //     this.$refs.tableWrapper.scrollWidth -
    //     this.$refs.tableWrapper.clientWidth;

    //   // Check for RTL based on the <body> element
    //   const isRtl = getComputedStyle(document.body).direction === "rtl";
    //   if (isRtl) {
    //     // In RTL, the scrollLeft can be negative in some browsers.
    //     // We invert the values for RTL handling.
    //     scrollLeft = Math.abs(scrollLeft);
    //   }

    //   // Set isScrolling to true if the table is not at the start or end of the scroll
    //   this.isScrolling = scrollLeft > 0 || scrollLeft === maxScrollLeft;
    // },

    handleTableScroll() {
      // is used to apply last-sticky to last th || td that is sticky
      // Check if the table is being scrolled
      const scrollLeft = this.$refs.tableWrapper.scrollLeft;
      const maxScrollLeft =
        this.$refs.tableWrapper.scrollWidth -
        this.$refs.tableWrapper.clientWidth;

      // Set isScrolling to true if the table is not at the start or end of the scroll
      this.isScrolling = scrollLeft > 0 || scrollLeft === maxScrollLeft;
    },
    // Customize Headers
    handleShowCustomizeHeadersModal() {
      this.showCustomizeHeadersModal = true;
    },
    handleCancelCustomizeHeadersModal() {
      this.showCustomizeHeadersModal = false;
      this.resetCustomHeaders();
    },
    resetCustomHeaders() {
      if (!this.handelLoadCustomHeaders()) {
        this.mappedHeaders = this.headers.map((header) => ({
          ...header,
          required: header.required || false,
          width: header.width || 140,
          isVisible: true,
        }));
      } else {
        this.mappedHeaders = this.headers.map((header) => ({
          ...header,
          required: header.required || false,
          width: header.width || 140,
          isVisible: this.handelLoadCustomHeaders().includes(header.value),
        }));
      }
      this.mappedVisibleHeaders = this.mappedHeaders.filter(
        (header) => header.isVisible,
      );
    },
    handleSaveCustomizeHeaders() {
      const visibleHeaders = this.mappedHeaders
        .filter((header) => header.isVisible)
        .map((header) => header.value);

      saveCustomHeaders(this.tableId, visibleHeaders);
      this.mappedVisibleHeaders = this.mappedHeaders.filter(
        (header) => header.isVisible,
      );
      this.showCustomizeHeadersModal = false;
    },
    handelLoadCustomHeaders() {
      return this.tableId ? loadCustomHeaders(this.tableId) : null;
    },
    handleTableSearch() {
      this.$emit("onSearch", this.searchTerm);
    },
    handleRowActionClick(action, item) {
      const actions = {
        edit: "onEditRow",
        duplicate: "onDuplicateRow",
        delete: "onDeleteRow",
      };
      this.$emit(actions[action], item);
    },
    handleEditRow(item) {
      this.$emit("onEdit", item);
    },
    handleDuplicateRow(item) {
      this.$emit("onDuplicate", item);
    },
    handleDeleteRow(item) {
      this.$emit("onDelete", item);
    },
    handleCustomExport(type) {
      if (type === "pdf") {
        exportToPDF(this.items);
      } else if (type === "csv") {
        exportToCSV(this.items);
      } else if (type === "excel") {
        exportToExcel(this.items);
      }
      // close();
    },
  },
};
</script>

<style lang="scss" scoped>
.chatbot {
  // border: 1px solid var(--zinc-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &--default {
    border: none;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 10px;
    border-bottom: 1px solid var(--gray-300);
    flex-shrink: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.6rem;
    color: var(--blue-600);
  }

  &__icons {
    line-height: 0;
  }

  &__search {
    width: 300px;
  }

  &__buttons {
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__button {
    &--order {
      order: 1;
    }
  }

  &__row {
    padding: 10px;
    // border-bottom: 1px solid #343434;
    border-block-end: 1px solid var(--gray-300);
    flex-shrink: 0;
  }

  &__content {
    padding: 10px;
    overflow: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;

    &--default {
      padding: 0;
    }
  }

  &__wrapper {
    overflow: auto;
    border-radius: 8px;
    // border: 1px solid #343434;
    border: 1px solid var(--gray-300);
    position: relative;
    flex: 1;

    &--loading {
      overflow: hidden;
    }
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: auto;
  }

  /* &__thead {
  } */
  &__tr {
    // background-color: rgb(28, 28, 28);
    // background-color: var(--gray-50);

    transition: background-color 300ms ease-in-out;
  }

  &__th {
    // border-bottom: 1px solid #343434; // #212225 #27272a
    border-bottom: 1px solid var(--gray-300);
    border-inline-end: 1px solid var(--gray-300);
    // background-color: var(--gray-100);
    background-color: var(--white);

    position: sticky;
    top: 0;
    z-index: 10;
    /* padding: 10px 16px; */
    padding: 8px;
    height: 48px;

    &:first-child {
      border-start-start-radius: 4px;
    }

    &:last-child {
      border-start-end-radius: 4px;
      border-inline-end: 0px;
    }

    &--sticky {
      position: sticky;
      inset-inline-start: 0;
      z-index: 11;
    }

    &--last-sticky {
      &::before {
        /* content: "";
        width: 4px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        background-color: #343434; */
        content: "";
        pointer-events: none;
        width: 36px;
        display: inline-block;
        height: 100%;
        position: absolute;
        top: 0px;
        inset-inline-end: -36px;
        box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.3);
      }
    }

    &--border {
      &:not(:last-child) {
        /* border-inline-end: 1px solid #343434; */
      }
    }

    &-content {
      display: flex;
      align-items: center;
      font-size: 1.6rem;
      font-weight: 500;
      color: var(--gray-700);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      height: 100%;
      // alignment
      &--left,
      &--start {
        justify-content: start;
      }

      &--center {
        justify-content: center;
      }

      &--right,
      &--end {
        justify-content: end;
      }
    }
  }

  &__td {
    position: relative;
    z-index: 1;
    // background-color: var(--gray-50);
    background-color: var(--white);
    border-block-end: 1px solid var(--gray-300);
    padding: 8px 16px;
    // padding: 12px;
    height: 48px;
    min-height: 48px;
    // display: flex;
    // align-items: center;

    &--sticky {
      position: sticky;
      top: 0;
      inset-inline-start: 0;
      z-index: 2;
      /* box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); */
    }

    &--center {
      text-align: center;
    }

    &--last-sticky {
      &::before {
        content: "";
        pointer-events: none;
        width: 36px;
        display: inline-block;
        height: 100%;
        position: absolute;
        top: 0px;
        inset-inline-end: -36px;
        box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.3);
      }
    }

    &--border {
      &:not(:last-child) {
        /* border-inline-end: 1px solid #343434; */
      }
    }

    &-content {
      // display: flex;
      // align-items: center;
      font-size: 1.6rem;
      color: var(--gray-900);
      font-weight: 400;
      // overflow: hidden;
      // text-overflow: ellipsis;
      // white-space: nowrap;
      height: 100%;
      display: flex;
      align-items: center;
      // alignment
      &--left,
      &--start {
        justify-content: start;
      }

      &--center {
        justify-content: center;
      }

      &--right,
      &--end {
        justify-content: end;
      }
      span {
        // overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  /* :is(td, th) {
    padding: 8px 16px;
  } */

  /* &__sort {
  } */

  &__tbody {
    tr:hover {
      background-color: var(--slate-50);
    }
  }

  &__sort {
    line-height: 0;
    margin-inline-start: 4px;
    cursor: pointer;
  }

  /* &__col {
  } */

  &__loading,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 240px;
  }

  &__loading {
    &--active {
      &::before {
        content: "";
        position: absolute;
        width: 40px;
        height: 40px;
        border: 3px solid #ededed;
        border-inline-start: 2px solid #545454;
        border-radius: 50%;
        z-index: 1;
        animation: spinner 1s linear infinite;
      }
    }
  }

  &__message {
    font-size: 1.6rem;
    text-transform: capitalize;
    color: var(--gray-900);
  }

  &__pagination {
    padding: 10px;
    border-top: 1px solid var(--gray-300);
    flex-shrink: 0;
  }

  /* Customize Headers Modal */
  &__items {
    padding: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
      margin-block-end: 16px;
      padding-block-end: 16px;
      border-bottom: 1px solid #343434;
    }
  }

  &__name {
    font-size: 1.4rem;
    color: var(--gray-900);
  }

  &__required {
    font-size: 1.4rem;
    color: var(--gray-600);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    // &--space {
    //   gap: 24px;
    // }

    &--center {
      justify-content: center;
    }
  }

  &__action {
    // position: relative;
    // cursor: pointer;

    // &--delete {
    //   background-color: #291415;
    //   border-radius: 4px;
    //   padding: 8px;
    // }

    // &::after {
    //   content: "";
    //   position: absolute;
    //   top: 0;
    //   left: 50%;
    //   transform: translate(-50%, -10px);
    //   border-width: 10px;
    //   border-style: solid;
    //   border-color: #545454 transparent transparent transparent;
    //   opacity: 0;
    //   visibility: hidden;
    //   transition:
    //     opacity 300ms ease-in-out,
    //     visibility 300ms ease-in-out;
    // }

    // &::before {
    //   content: attr(data-tooltip);
    //   position: absolute;
    //   z-index: 999;
    //   top: 0;
    //   left: 50%;
    //   transform: translate(-50%, calc(-100% - 10px));
    //   font-size: 1.2rem;
    //   white-space: nowrap;
    //   text-align: center;
    //   color: #fff;
    //   background-color: #545454;
    //   padding: 6px 12px;
    //   border-radius: 4px;
    //   opacity: 0;
    //   visibility: hidden;
    //   transition:
    //     opacity 300ms ease-in-out,
    //     visibility 300ms ease-in-out;
    // }

    // &:hover::before,
    // &:hover::after {
    //   opacity: 1;
    //   visibility: visible;
    // }
  }

  &__icon {
    line-height: 0;
  }
}

.export {
  &__dropdown {
    padding: 4px;
    width: 160px;
  }

  &__header {
    padding: 8px 12px;
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--gray-700);
    text-transform: uppercase;
  }

  &__divider {
    height: 1px;
    margin-block: 4px;
    background-color: var(--gray-300);
  }
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }

  from {
    transform: rotate(0deg);
  }
}
</style>
