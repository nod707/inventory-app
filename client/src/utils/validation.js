export const validateProduct = (formData) => {
  const errors = {};

  // Required fields
  if (!formData.type) {
    errors.type = 'Garment type is required';
  }

  if (!formData.brand?.trim()) {
    errors.brand = 'Brand is required';
  }

  if (!formData.style?.trim()) {
    errors.style = 'Style is required';
  }

  if (!formData.date) {
    errors.date = 'Purchase date is required';
  }

  if (!formData.condition) {
    errors.condition = 'Condition is required';
  }

  // Price validation
  if (!formData.purchasePrice) {
    errors.purchasePrice = 'Purchase price is required';
  } else if (isNaN(formData.purchasePrice) || parseFloat(formData.purchasePrice) < 0) {
    errors.purchasePrice = 'Please enter a valid price';
  }

  if (formData.soldPrice && (isNaN(formData.soldPrice) || parseFloat(formData.soldPrice) < 0)) {
    errors.soldPrice = 'Please enter a valid price';
  }

  // Images validation
  if (!formData.images?.length) {
    errors.images = 'At least one image is required';
  }

  // Measurements validation
  const requiredMeasurements = {
    shirt: ['neck', 'chest', 'waist', 'length', 'sleeve'],
    pants: ['waist', 'inseam', 'length', 'hip'],
    dress: ['bust', 'waist', 'hip', 'length'],
    skirt: ['waist', 'hip', 'length']
  };

  if (formData.type && requiredMeasurements[formData.type]) {
    const measurements = formData.measurements || {};
    requiredMeasurements[formData.type].forEach(measurement => {
      if (!measurements[measurement]) {
        if (!errors.measurements) {
          errors.measurements = {};
        }
        errors.measurements[measurement] = `${measurement.charAt(0).toUpperCase() + measurement.slice(1)} measurement is required`;
      }
    });
  }

  // Description validation
  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length < 20) {
    errors.description = 'Description should be at least 20 characters';
  }

  // Hashtags validation
  if (!formData.hashtags?.length) {
    errors.hashtags = 'At least one hashtag is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatValidationErrors = (errors) => {
  if (!errors) return {};

  const formatted = {};
  Object.entries(errors).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      formatted[key] = formatValidationErrors(value);
    } else {
      formatted[key] = {
        error: true,
        helperText: value
      };
    }
  });
  return formatted;
};
