import ProfileAPI from "@/api/profile.api";
import { defineStore } from "pinia";

export const useProfileStore = defineStore("settings_profile", {
  state: () => ({
    records: {
      profile: {},
    },
    uiFlags: {
      isLoading: false,
      isUpdating: false,
      isSaving: false,
      isDeleting: false,
      isCreating: false,
      isEditing: false,
      isFetching: false,
    },
  }),
  getters: {
    profileData(state) {
      return state.records.profile;
    },
  },
  actions: {
    async getProfileData(params) {
      this.uiFlags.isFetching = true;
      try {
        const { data } = await ProfileAPI.get(params);
        const [profile] = data;
        this.records.profile = profile;
        return data;
      } catch (error) {
        throw new Error(error);
      } finally {
        this.uiFlags.isFetching = false;
      }
    },
    async updateProfile(id, data) {
      this.uiFlags.isUpdating = true;
      try {
        const response = await ProfileAPI.update(id, data);
      } catch (error) {
        throw new Error(error);
      } finally {
        this.uiFlags.isUpdating = false;
      }
    },
    async deleteProfile(id) {
      this.uiFlags.isDeleting = true;
      try {
        const { data, totalPages } = await ProfileAPI.delete(id);
      } catch (error) {
        throw new Error(error);
      } finally {
        this.uiFlags.isDeleting = false;
      }
    },
  },
});
