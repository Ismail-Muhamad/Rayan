import { computed } from "vue";
import { useI18n } from "vue-i18n";

/**
 * useValidation Composable
 *
 * Helper methods for Vuelidate validation
 * Provides error message formatting and validation utilities
 */

export function useValidation() {
  const { t } = useI18n();

  /**
   * Get the first error message from a Vuelidate field
   * @param {Object} field - Vuelidate field object (e.g., v$.email)
   * @returns {string} - First error message or empty string
   */
  const getFieldErrorMessage = (field) => {
    if (!field || !field.$errors || field.$errors.length === 0) {
      return "";
    }
    const error = field.$errors[0];
    // Handle validator-specific messages
    const validatorName = error.$validator;
    const params = error.$params;
    // Common validation messages
    const messages = {
      required: t("validation.required"),
      email: t("validation.email"),
      minLength: t("validation.min_length", { min: params?.min }),
      maxLength: t("validation.max_length", { max: params?.max }),
      minValue: t("validation.min_value", { min: params?.min }),
      maxValue: t("validation.max_value", { max: params?.max }),
      sameAs: t("validation.same_as", { field: params?.otherName }),
      url: t("validation.url"),
      numeric: t("validation.numeric"),
      integer: t("validation.integer"),
      alpha: t("validation.alpha"),
      alphaNum: t("validation.alpha_num"),
      length: t("validation.length", { length: params?.length }),
      between: t("validation.between", {
        min: params?.min,
        max: params?.max,
      }),
      digits: t("validation.digits", { digits: params?.digits }),
      maxEmoji: t("validation.max_emoji", { length: params?.length }),
      equal: t("validation.equal", { value: params?.value }),
      notEqual: t("validation.not_equal", { value: params?.value }),
      different: t("validation.different", { field: params?.otherName }),
      unique: t("validation.unique"),
      // Password validation messages
      password_contains_at_least_1_special_character: t(
        "validation.password_contains_at_least_1_special_character",
      ),
      password_contains_at_least_1_lowercase: t(
        "validation.password_contains_at_least_1_lowercase",
      ),
      password_contains_at_least_1_uppercase: t(
        "validation.password_contains_at_least_1_uppercase",
      ),
      password_contains_at_least_1_number: t(
        "validation.password_contains_at_least_1_number",
      ),
    };

    return messages[validatorName] || t("validation.invalid");
  };

  /**
   * Get all error messages from a Vuelidate field
   * @param {Object} field - Vuelidate field object
   * @returns {Array<string>} - Array of error messages
   */
  const getAllErrorMessages = (field) => {
    if (!field || !field.$errors || field.$errors.length === 0) {
      return [];
    }

    return field.$errors.map((error) => {
      if (error.$message && typeof error.$message === "string") {
        return error.$message;
      }
      return getFieldErrorMessage({ $errors: [error] });
    });
  };

  /**
   * Check if a field has errors
   * @param {Object} field - Vuelidate field object
   * @returns {boolean}
   */
  const isFieldHasError = (field) => field && field.$error === true;

  /**
   * Check if a field is valid
   * @param {Object} field - Vuelidate field object
   * @returns {boolean}
   */
  const isValid = (field) => field && field.$invalid === false;

  /**
   * Check if a field has been touched
   * @param {Object} field - Vuelidate field object
   * @returns {boolean}
   */
  const isTouched = (field) => field && field.$dirty === true;

  /**
   * Reset validation state for a field
   * @param {Object} field - Vuelidate field object
   */
  const resetField = (field) => {
    if (field && field.$reset) {
      field.$reset();
    }
  };

  /**
   * Reset validation state for entire form
   * @param {Object} v$ - Vuelidate instance
   */
  const resetForm = (v$) => {
    if (v$ && v$.$reset) {
      v$.$reset();
    }
  };

  /**
   * Touch all fields in the form
   * @param {Object} v$ - Vuelidate instance
   */
  const touchForm = (v$) => {
    if (v$ && v$.$touch) {
      v$.$touch();
    }
  };

  /**
   * Validate entire form
   * @param {Object} v$ - Vuelidate instance
   * @returns {Promise<boolean>} - True if valid, false otherwise
   */
  const validateForm = async (v$) => {
    if (!v$ || !v$.$validate) {
      return false;
    }

    const isValid = await v$.$validate();
    return isValid;
  };

  /**
   * Get field state classes for styling
   * @param {Object} field - Vuelidate field object
   * @returns {Object} - Object with class names
   */
  const getFieldClasses = (field) => ({
    "field--error": isFieldHasError(field),
    "field--valid": isValid(field) && isTouched(field),
    "field--touched": isTouched(field),
  });

  /**
   * Create a computed error message for a field
   * @param {Object} field - Vuelidate field object
   * @returns {ComputedRef<string>}
   */
  const createErrorMessage = (field) =>
    computed(() => getFieldErrorMessage(field));

  return {
    // Error messages
    getFieldErrorMessage,
    getAllErrorMessages,
    createErrorMessage,

    // Field state
    isFieldHasError,
    isValid,
    isTouched,

    // Form actions
    resetField,
    resetForm,
    touchForm,
    validateForm,

    // Utilities
    getFieldClasses,
  };
}

// /**
//  * Custom validation rules
//  */
// export const customValidators = {
//   /**
//    * Validate phone number
//    */
//   phone: (value) => {
//     if (!value) return true;
//     const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
//     return phoneRegex.test(value);
//   },

//   /**
//    * Validate strong password
//    * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
//    */
//   strongPassword: (value) => {
//     if (!value) return true;
//     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
//     return strongPasswordRegex.test(value);
//   },

//   /**
//    * Validate URL with protocol
//    */
//   urlWithProtocol: (value) => {
//     if (!value) return true;
//     try {
//       const url = new URL(value);
//       return ['http:', 'https:'].includes(url.protocol);
//     } catch {
//       return false;
//     }
//   },

//   /**
//    * Validate no whitespace
//    */
//   noWhitespace: (value) => {
//     if (!value) return true;
//     return !/\s/.test(value);
//   },

//   /**
//    * Validate file size (in bytes)
//    */
//   maxFileSize: (maxSize) => (file) => {
//     if (!file) return true;
//     return file.size <= maxSize;
//   },

//   /**
//    * Validate file type
//    */
//   fileType: (allowedTypes) => (file) => {
//     if (!file) return true;
//     return allowedTypes.includes(file.type);
//   },
// };
