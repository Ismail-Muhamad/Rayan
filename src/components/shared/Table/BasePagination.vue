<template>
  <div class="pagination">
    <div class="pagination__info">
      {{ $t("GLOBAL.TABLE.PAGINATION.INFO.SHOWING") }}
      <span class="pagination__number">{{ startEntry }}</span>
      {{ $t("GLOBAL.TABLE.PAGINATION.INFO.TO") }}
      <span class="pagination__number">{{ endEntry }}</span>
      {{ $t("GLOBAL.TABLE.PAGINATION.INFO.OF") }}
      <span class="pagination__number"> {{ meta.total }}</span>
      {{ $t("GLOBAL.TABLE.PAGINATION.INFO.ENTRIES") }}
    </div>
    <div class="pagination__controls">
      <button
        :class="[
          'pagination__control pagination__control--prev',
          {
            'pagination__control--disabled': currentPage === 1,
          },
        ]"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        {{ $t("GLOBAL.TABLE.PAGINATION.CONTROLS.PREVIOUS") }}
      </button>
      <button
        v-for="page in pages"
        :key="page"
        :class="[
          'pagination__control pagination__control--page',
          { 'pagination__control--active': currentPage === page },
        ]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      <button
        :class="[
          'pagination__control pagination__control--next',
          { 'pagination__control--disabled': currentPage === pagesCount },
        ]"
        :disabled="currentPage === pagesCount"
        @click="nextPage"
      >
        {{ $t("GLOBAL.TABLE.PAGINATION.CONTROLS.NEXT") }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErabyPagination",
  props: {
    meta: {
      type: Object,
      required: true,
      default: () => ({
        total: 0,
        perPage: 10,
      }),
    },
  },
  emits: ["pageChange"],
  data() {
    return {
      currentPage: 1,
    };
  },
  computed: {
    pagesCount() {
      return Math.ceil(this.meta.total / this.meta.perPage);
    },

    startEntry() {
      return (this.currentPage - 1) * this.meta.perPage + 1;
    },
    endEntry() {
      return Math.min(this.currentPage * this.meta.perPage, this.meta.total);
    },
    pages() {
      const pages = [];
      if (this.pagesCount <= 5) {
        for (let i = 1; i <= this.pagesCount; i++) {
          pages.push(i);
        }
      } else if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", this.pagesCount);
      } else if (this.currentPage >= this.pagesCount - 2) {
        pages.push(
          1,
          "...",
          this.pagesCount - 3,
          this.pagesCount - 2,
          this.pagesCount - 1,
          this.pagesCount
        );
      } else {
        pages.push(
          1,
          "...",
          this.currentPage - 1,
          this.currentPage,
          this.currentPage + 1,
          "...",
          this.pagesCount
        );
      }
      return pages;
    },
  },
  watch: {
    meta: {
      handler() {
        this.currentPage = this.meta.currentPage;
      },
      deep: true,
    },
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.pagesCount) {
        this.currentPage++;
        this.$emit("pageChange", this.currentPage);
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.$emit("pageChange", this.currentPage);
      }
    },
    goToPage(page) {
      if (page !== "..." && page !== this.currentPage) {
        this.currentPage = page;
        this.$emit("pageChange", this.currentPage);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__info {
    font-size: 1.4rem;
    color: var(--gray-500);
  }

  &__number {
    display: inline-block;
    text-align: center;
    color: var(--gray-700);
    background-color: var(--white);
    border: 1px solid var(--gray-300);
    padding: 4px 8px;
    border-radius: 8px;
    min-width: 50px;
    margin-inline: 2px;
  }

  &__controls {
    border: 1px solid var(--gray-300);
    padding: 4px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__control {
    height: 100%;
    padding: 4px;
    border-radius: 4px;
    font-size: 1.2rem;
    color: var(--gray-700);
    background-color: var(--white);
    border: 1px solid var(--gray-300);
    cursor: pointer;

    &--active {
      background-color: var(--blue-50);
      color: var(--blue-600);
      border-color: var(--blue-200);
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
      background-color: var(--gray-50);
      color: var(--gray-400);
    }

    &--page {
      padding: 4px 8px;
    }
  }
}
</style>
