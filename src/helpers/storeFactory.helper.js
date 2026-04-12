/**
 * Pinia store factory for creating CRUD stores
 * @module stores/factory
 */
import { defineStore } from "pinia";
import { toast } from "vue-sonner";
import i18n from "@/plugins/i18n";
import serverErrorHandler from "@/helpers/serverErrorHandler";

// Constants
const MESSAGE_KEYS = Object.freeze({
  SAVE: i18n.global.t("GLOBAL.MESSAGES.SUCCESS.SAVE"),
  UPDATE: i18n.global.t("GLOBAL.MESSAGES.SUCCESS.UPDATE"),
  DELETE: i18n.global.t("GLOBAL.MESSAGES.SUCCESS.DELETE"),
  BATCH_DELETE: i18n.global.t("GLOBAL.MESSAGES.SUCCESS.BATCH_DELETE"),
});

const UI_FLAGS = Object.freeze({
  FETCHING_LIST: "isFetchingList",
  FETCHING_ITEM: "isFetchingItem",
  CREATING: "isCreating",
  UPDATING: "isUpdating",
  DELETING: "isDeleting",
});

/**
 * Initialize state for CRUD store
 * @returns {Object} Initial state object
 */
export const createInitialState = () => ({
  records: [],
  record: null,
  error: null,
  meta: {
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
  },
  uiFlags: {
    [UI_FLAGS.FETCHING_LIST]: false,
    [UI_FLAGS.FETCHING_ITEM]: false,
    [UI_FLAGS.CREATING]: false,
    [UI_FLAGS.UPDATING]: false,
    [UI_FLAGS.DELETING]: false,
  },
});

/**
 * Parse API errors into a consistent format
 * @param {Error} error - API error
 * @returns {Object} Parsed error object
 */
const parseError = (error) => {
  // if (error.response) {
  //   const { data, status } = error.response;
  //   return {
  //     message: data?.message || error.message || "An error occurred",
  //     status,
  //     details: data?.errors || null,
  //   };
  // }

  return {
    message: serverErrorHandler(error),
    status: 0,
    details: null,
  };
};

/**
 * Calculate pagination after deletion
 * @param {number} currentPage - Current page number
 * @param {number} recordsCount - Number of records on current page
 * @param {number} lastPage - Last page number
 * @returns {number} New page number
 */
const calculatePageAfterDeletion = (currentPage, recordsCount, lastPage) => {
  // If current page is empty or we're on the last page with only one item
  if (recordsCount === 0 || (currentPage === lastPage && recordsCount === 1)) {
    return Math.max(1, currentPage - 1);
  }
  return currentPage;
};

/**
 * Create getters for CRUD store
 * @returns {Object} Getters object
 */
export const createGetters = () => ({
  /**
   * Get sorted records (descending by ID)
   */
  getRecords: (state) => [...state.records].sort((a, b) => b.id - a.id),

  /**
   * Get filtered records
   */
  filteredRecords: (state) => (filterFn) => {
    if (typeof filterFn !== "function") return state.records;
    return state.records.filter(filterFn);
  },

  /**
   * Get record by ID
   */
  getRecordById: (state) => (id) =>
    state.records.find((record) => record.id == id) || null,

  /**
   * Get all UI flags
   */
  getUIFlags: (state) => state.uiFlags,

  /**
   * Get specific UI flag
   */
  getUiFlag: (state) => (key) => state.uiFlags[key] ?? false,

  /**
   * Check if any operation is in progress
   */
  isLoading: (state) => Object.values(state.uiFlags).some(Boolean),

  /**
   * Get pagination metadata
   */
  getMeta: (state) => state.meta,

  /**
   * Get current error
   */
  getError: (state) => state.error,

  /**
   * Check if records exist
   */
  hasRecords: (state) => state.records.length > 0,

  /**
   * Get total records count
   */
  getTotalRecords: (state) => state.meta.total,
});

/**
 * Create CRUD actions for store
 * @param {Object} service - API service instance
 * @returns {Object} Actions object
 */
export const createActions = (service) => ({
  /**
   * Fetch list of records
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Records array
   */
  async fetchRecords(params = {}) {
    this.uiFlags.isFetchingList = true;

    try {
      const response = await service.get(params);
      const data = response.data?.data || response.data || [];
      const meta = response.data?.meta || {};

      // Single $patch call for multiple related updates
      this.$patch((state) => {
        state.records = data;
        state.meta.currentPage = meta.current_page || meta.currentPage || 1;
        state.meta.lastPage = meta.last_page || meta.lastPage || 1;
        state.meta.perPage = meta.per_page || meta.perPage || 10;
        state.meta.total = meta.total || 0;
        state.error = null;
      });

      return data;
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));
      return [];
    } finally {
      this.uiFlags.isFetchingList = false;
    }
  },

  /**
   * Alias for fetchRecords (backward compatibility)
   */
  async get(params = {}) {
    return this.fetchRecords(params);
  },

  /**
   * Filter records
   * @param {string} filter - Filter string
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Filtered records
   */
  async filterRecords(filter, params = {}) {
    this.uiFlags.isFetchingList = true;

    try {
      const response = await service.filter(filter, params);
      const data = response.data?.data || [];
      const meta = response.data?.meta || {};

      this.$patch((state) => {
        state.records = data;
        state.meta.currentPage = meta.current_page || meta.currentPage || 1;
        state.meta.lastPage = meta.last_page || meta.lastPage || 1;
        state.meta.perPage = meta.per_page || meta.perPage || 10;
        state.meta.total = meta.total || 0;
        state.error = null;
      });

      return data;
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));
      return [];
    } finally {
      this.uiFlags.isFetchingList = false;
    }
  },

  /**
   * Fetch single record
   * @param {string|number} id - Record ID
   * @returns {Promise<Object|null>} Record object or null
   */
  async fetchRecord(id) {
    this.uiFlags.isFetchingItem = true;

    try {
      const response = await service.show(id);
      const data = response?.data?.data;

      this.record = data;
      this.error = null;

      return data;
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));
      return null;
    } finally {
      this.uiFlags.isFetchingItem = false;
    }
  },

  /**
   * Alias for fetchRecord (backward compatibility)
   */
  async show(id) {
    return this.fetchRecord(id);
  },

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @param {Object} options - Options object
   * @returns {Promise<Object>} Result object
   */
  async createRecord(data, options = {}) {
    const { withToast = true, toastKey = MESSAGE_KEYS.SAVE } = options;

    // Prevent duplicate requests
    if (this.uiFlags.isCreating) {
      return { isCreated: false, error: "Request already in progress" };
    }

    this.uiFlags.isCreating = true;

    try {
      const response = await service.create(data);
      this.error = null;

      if (withToast) {
        toast.success(toastKey);
      }

      return {
        isCreated: true,
        data: response.data,
      };
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));

      // return {
      //   isCreated: false,
      //   error: errorObj,
      // };
    } finally {
      this.uiFlags.isCreating = false;
    }
  },

  /**
   * Alias for createRecord (backward compatibility)
   */
  async create(data, withToast = true, toastKey = MESSAGE_KEYS.SAVE) {
    return this.createRecord(data, { withToast, toastKey });
  },

  /**
   * Update an existing record
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @param {Object} options - Options object
   * @returns {Promise<Object>} Result object
   */
  async updateRecord(id, data, options = {}) {
    const {
      params = {},
      withToast = true,
      toastKey = MESSAGE_KEYS.UPDATE,
    } = options;

    // Prevent duplicate requests
    if (this.uiFlags.isUpdating) {
      return { isUpdated: false, error: "Request already in progress" };
    }

    this.uiFlags.isUpdating = true;

    try {
      const response = await service.update(id, data, params);

      this.error = null;

      if (withToast) {
        toast.success(toastKey);
      }

      return {
        isUpdated: true,
        data: response.data,
      };
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));

      // return {
      //   isUpdated: false,
      //   error: errorObj,
      // };
    } finally {
      this.uiFlags.isUpdating = false;
    }
  },

  /**
   * Alias for updateRecord (backward compatibility)
   */
  async update(
    id,
    data,
    params = {},
    withToast = true,
    toastKey = MESSAGE_KEYS.UPDATE,
  ) {
    return this.updateRecord(id, data, { params, withToast, toastKey });
  },

  /**
   * Delete a record
   * @param {string|number} id - Record ID
   * @param {Object} options - Options object
   * @returns {Promise<Object>} Result object
   */
  async deleteRecord(id, options = {}) {
    const {
      params = {},
      withToast = true,
      toastKey = MESSAGE_KEYS.DELETE,
      refreshList = true,
    } = options;

    // Prevent duplicate requests
    if (this.uiFlags.isDeleting) {
      return { isDeleted: false, error: "Request already in progress" };
    }

    this.uiFlags.isDeleting = true;

    try {
      await service.delete(id, params);

      // Optimistic update using function form of $patch for better performance
      const filteredRecords = this.records.filter((record) => record.id != id);

      this.$patch((state) => {
        state.records = filteredRecords;
        state.record = null;
        state.error = null;
      });

      // Refresh list with proper pagination
      if (refreshList) {
        const newPage = calculatePageAfterDeletion(
          this.meta.currentPage,
          filteredRecords.length,
          this.meta.lastPage,
        );

        await this.fetchRecords({
          page: newPage,
          per_page: this.meta.perPage,
        });
      }

      if (withToast) {
        toast.success(toastKey);
      }

      return { isDeleted: true };
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));

      // return {
      //   isDeleted: false,
      //   error: errorObj,
      // };
    } finally {
      this.uiFlags.isDeleting = false;
    }
  },

  /**
   * Alias for deleteRecord (backward compatibility)
   */
  async delete(
    id,
    params = {},
    withToast = true,
    toastKey = MESSAGE_KEYS.DELETE,
  ) {
    return this.deleteRecord(id, { params, withToast, toastKey });
  },

  /**
   * Delete multiple records
   * @param {Array<string|number>} ids - Array of record IDs
   * @param {Object} options - Options object
   * @returns {Promise<Object>} Result object
   */
  async deleteRecordsBatch(ids, options = {}) {
    const { withToast = true, toastKey = MESSAGE_KEYS.BATCH_DELETE } = options;

    if (!Array.isArray(ids) || ids.length === 0) {
      return { isDeleted: false, error: "Invalid IDs array" };
    }

    // Prevent duplicate requests
    if (this.uiFlags.isDeleting) {
      return { isDeleted: false, error: "Request already in progress" };
    }

    this.uiFlags.isDeleting = true;

    try {
      await service.batchDelete(ids);

      this.$patch((state) => {
        state.records = state.records.filter(
          (record) => !ids.includes(record.id),
        );
        state.record = null;
        state.error = null;
      });

      if (withToast) {
        toast.success(toastKey);
      }

      return { isDeleted: true };
    } catch (error) {
      // const errorObj = parseError(error);
      // this.error = errorObj;
      toast.error(serverErrorHandler(error));

      // return {
      //   isDeleted: false,
      //   error: errorObj,
      // };
    } finally {
      this.uiFlags.isDeleting = false;
    }
  },

  /**
   * Alias for deleteRecordsBatch (backward compatibility)
   */
  async deleteBatch(
    ids,
    withToast = true,
    toastKey = MESSAGE_KEYS.BATCH_DELETE,
  ) {
    return this.deleteRecordsBatch(ids, { withToast, toastKey });
  },

  /**
   * Clear error state
   */
  clearError() {
    this.error = null;
  },

  /**
   * Clear current record
   */
  clearRecord() {
    this.record = null;
  },

  /**
   * Reset store to initial state
   */
  resetStore() {
    this.$reset();
  },

  /**
   * Set UI flag manually
   * @param {string} key - Flag key
   * @param {boolean} value - Flag value
   */
  setUiFlag(key, value) {
    this.uiFlags[key] = value;
  },
});

/**
 * Create a Pinia CRUD store
 * @param {string} storeName - Unique store identifier
 * @param {Object} service - API service instance
 * @param {Object} options - Additional configuration
 * @param {Function} options.state - Additional state function
 * @param {Object} options.getters - Additional getters
 * @param {Object} options.actions - Additional actions
 * @returns {Function} Pinia store
 */
const createStore = (storeName, service, options = {}) => {
  if (!storeName || typeof storeName !== "string") {
    throw new Error("Store name is required and must be a string");
  }

  if (!service || typeof service !== "object") {
    throw new Error("Service is required and must be an object");
  }

  return defineStore(storeName, {
    state: () => ({
      ...createInitialState(),
      ...(typeof options.state === "function" ? options.state() : {}),
    }),
    getters: {
      ...createGetters(),
      ...(options.getters || {}),
    },
    actions: {
      ...createActions(service),
      ...(options.actions || {}),
    },
  });
};

export default createStore;
export { MESSAGE_KEYS, UI_FLAGS };
