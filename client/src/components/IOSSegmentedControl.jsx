import React from 'react';
import { Box, ButtonBase, Typography, styled, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const SegmentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: 2,
  backgroundColor: theme.palette.grey[200],
  borderRadius: 8,
  position: 'relative',
  width: '100%',
}));

const SegmentButton = styled(ButtonBase)(({ theme, selected }) => ({
  flex: 1,
  padding: '6px 16px',
  borderRadius: 6,
  zIndex: 1,
  transition: theme.transitions.create(['color'], {
    duration: theme.transitions.duration.shorter,
  }),
  color: selected ? theme.palette.common.white : theme.palette.grey[600],
  '&:hover': {
    color: selected ? theme.palette.common.white : theme.palette.grey[800],
  },
}));

const IOSSegmentedControl = ({
  value,
  onChange,
  segments,
  size = 'medium',
  color = 'primary',
}) => {
  const theme = useTheme();
  const activeIndex = segments.findIndex((segment) => segment.value === value);

  const getSize = () => {
    switch (size) {
      case 'small':
        return {
          height: 28,
          fontSize: 13,
        };
      case 'large':
        return {
          height: 40,
          fontSize: 15,
        };
      default: // medium
        return {
          height: 32,
          fontSize: 14,
        };
    }
  };

  const sizeStyles = getSize();

  return (
    <SegmentContainer sx={{ height: sizeStyles.height }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={value}
          initial={false}
          animate={{
            x: `${(100 / segments.length) * activeIndex}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 35,
          }}
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            width: `calc(${100 / segments.length}% - 4px)`,
            backgroundColor: theme.palette[color].main,
            borderRadius: 6,
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {segments.map((segment) => (
        <SegmentButton
          key={segment.value}
          selected={value === segment.value}
          onClick={() => onChange(segment.value)}
          sx={{ height: '100%' }}
        >
          <Typography
            sx={{
              fontSize: sizeStyles.fontSize,
              fontWeight: value === segment.value ? 600 : 400,
              transition: theme.transitions.create(['font-weight'], {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            {segment.label}
          </Typography>
        </SegmentButton>
      ))}
    </SegmentContainer>
  );
};

export default IOSSegmentedControl;
