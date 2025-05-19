import { ref, computed, watch } from 'vue';

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: Record<string, Array<(value: any) => boolean | string>>;
  onSubmit?: (values: T) => Promise<void> | void;
  onReset?: () => void;
}

interface VForm {
  validate: () => Promise<{ valid: boolean; errors: any[] }>;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    validationRules = {} as Record<string, Array<(value: any) => boolean | string>>,
    onSubmit,
    onReset,
  } = options;

  // Form state
  const formRef = ref<VForm | null>(null);
  const formValues = ref<T>({ ...initialValues });
  const formErrors = ref<Record<string, string>>({});
  const formTouched = ref<Record<string, boolean>>({});
  const isSubmitting = ref(false);
  const isValid = ref(true);
  const isDirty = ref(false);

  // Track original values for dirty checking
  const originalValues = { ...initialValues };

  // Methods
  const validateField = (field: string) => {
    if (!validationRules[field]) return true;

    const rules = validationRules[field];
    const value = formValues.value[field as keyof typeof formValues.value];

    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        formErrors.value[field] = typeof result === 'string' ? result : 'ข้อมูลไม่ถูกต้อง';
        return false;
      }
    }

    formErrors.value[field] = '';
    return true;
  };

  const validateForm = async () => {
    // First run our custom field validations
    let isFormValid = true;
    
    for (const field in validationRules) {
      const fieldValid = validateField(field);
      if (!fieldValid) {
        isFormValid = false;
      }
    }
    
    // Then run Vuetify's form validation if available
    if (formRef.value) {
      const { valid } = await formRef.value.validate();
      isFormValid = isFormValid && valid;
    }
    
    isValid.value = isFormValid;
    return isFormValid;
  };

  const handleSubmit = async () => {
    if (isSubmitting.value) return;
    
    // Mark all fields as touched
    for (const field in formValues.value) {
      formTouched.value[field] = true;
    }
    
    const valid = await validateForm();
    if (!valid) return;
    
    isSubmitting.value = true;
    
    try {
      if (onSubmit) {
        await onSubmit({ ...formValues.value });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      isSubmitting.value = false;
    }
  };

  const resetForm = () => {
    // Reset values to initial state
    formValues.value = { ...initialValues };
    
    // Clear errors and touched state
    formErrors.value = {};
    formTouched.value = {};
    
    // Reset Vuetify form if available
    if (formRef.value) {
      formRef.value.reset();
    }
    
    isDirty.value = false;
    
    if (onReset) {
      onReset();
    }
  };

  const setFieldValue = (field: keyof T, value: any) => {
    formValues.value = {
      ...formValues.value,
      [field]: value
    };
    
    // Mark field as touched when value is set
    formTouched.value[field.toString()] = true;
    
    // Validate field if it has rules
    if (validationRules[field.toString()]) {
      validateField(field.toString());
    }
  };

  // Computed properties
  const isFormValid = computed(() => {
    return isValid.value;
  });

  // Watch for changes to detect if form is dirty
  watch(
    formValues,
    () => {
      isDirty.value = Object.keys(initialValues).some(
        (key) => {
          const typedKey = key as keyof typeof initialValues;
          return formValues.value[typedKey] !== originalValues[typedKey];
        }
      );
    },
    { deep: true }
  );

  return {
    // Refs
    formRef,
    
    // State
    values: formValues,
    errors: formErrors,
    touched: formTouched,
    isSubmitting,
    isValid: isFormValid,
    isDirty,
    
    // Methods
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
}
