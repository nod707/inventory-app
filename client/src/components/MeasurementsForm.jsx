import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import Straight from '@mui/icons-material/Straight';
import HelpOutline from '@mui/icons-material/HelpOutline';
import CameraAlt from '@mui/icons-material/CameraAlt';
import AutoMeasure from './AutoMeasure';
import IOSFormGroup from './IOSFormGroup';
import IOSTextField from './IOSTextField';
import IOSSegmentedControl from './IOSSegmentedControl';

const measurementFields = {
  tops: [
    { name: 'chest', label: 'Chest Width', help: 'Measure across the fullest part of the chest' },
    { name: 'shoulders', label: 'Shoulder Width', help: 'Measure from shoulder seam to shoulder seam' },
    { name: 'length', label: 'Length', help: 'Measure from highest point of shoulder to bottom hem' },
    { name: 'sleeves', label: 'Sleeve Length', help: 'Measure from shoulder seam to end of sleeve' },
  ],
  bottoms: [
    { name: 'waist', label: 'Waist', help: 'Measure around the natural waistline' },
    { name: 'hips', label: 'Hips', help: 'Measure around the fullest part of the hips' },
    { name: 'inseam', label: 'Inseam', help: 'Measure from crotch to bottom of leg' },
    { name: 'outseam', label: 'Outseam', help: 'Measure from waist to bottom of leg' },
  ],
  dresses: [
    { name: 'chest', label: 'Chest Width', help: 'Measure across the fullest part of the chest' },
    { name: 'waist', label: 'Waist', help: 'Measure around the natural waistline' },
    { name: 'hips', label: 'Hips', help: 'Measure around the fullest part of the hips' },
    { name: 'length', label: 'Length', help: 'Measure from shoulder to hem' },
  ],
};

function MeasurementsForm({ category = 'tops', measurements = {}, onMeasurementChange }) {
  const [unit, setUnit] = useState('inches');
  const [showAutoMeasure, setShowAutoMeasure] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    // Convert measurements when unit changes
    const conversionFactor = newUnit === 'cm' ? 2.54 : 0.393701;
    const convertedMeasurements = Object.entries(measurements).reduce((acc, [key, value]) => {
      acc[key] = value * conversionFactor;
      return acc;
    }, {});
    Object.entries(convertedMeasurements).forEach(([key, value]) => {
      onMeasurementChange(key, value);
    });
  };

  const handleAutoMeasure = (field) => {
    setSelectedField(field);
    setShowAutoMeasure(true);
  };

  const handleMeasurementDetected = (value) => {
    if (selectedField) {
      onMeasurementChange(selectedField, value);
      setShowAutoMeasure(false);
      setSelectedField(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <IOSSegmentedControl
          value={unit}
          onChange={handleUnitChange}
          segments={[
            { value: 'inches', label: 'Inches' },
            { value: 'cm', label: 'Centimeters' },
          ]}
        />
      </Box>

      <IOSFormGroup>
        {measurementFields[category].map(({ name, label, help }) => (
          <Box
            key={name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <IOSTextField
              label={label}
              value={measurements[name] || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) || e.target.value === '') {
                  onMeasurementChange(name, value);
                }
              }}
              type="number"
              step="0.1"
              InputProps={{
                endAdornment: unit,
              }}
              sx={{ flex: 1 }}
            />
            
            <Tooltip title="Auto-measure with camera">
              <IconButton
                onClick={() => handleAutoMeasure(name)}
                size="small"
                sx={{ color: 'primary.main' }}
              >
                <CameraAlt />
              </IconButton>
            </Tooltip>

            <Tooltip title={help}>
              <IconButton size="small" sx={{ color: 'grey.500' }}>
                <HelpOutline />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </IOSFormGroup>

      <AutoMeasure
        open={showAutoMeasure}
        onClose={() => setShowAutoMeasure(false)}
        onMeasurementDetected={handleMeasurementDetected}
        measurementType={selectedField}
        unit={unit}
      />
    </Box>
  );
}

export default MeasurementsForm;
