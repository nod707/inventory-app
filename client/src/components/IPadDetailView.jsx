import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  useTheme,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const DetailContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '100%',
  height: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.grey[200]}`,
  zIndex: theme.zIndex.drawer,
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
  },
}));

const DetailHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

const DetailContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 600,
  color: theme.palette.grey[600],
  textTransform: 'uppercase',
  marginBottom: theme.spacing(2),
}));

const IPadDetailView = ({
  open,
  onClose,
  title,
  subtitle,
  sections = [],
  actions,
  children,
}) => {
  const theme = useTheme();

  // Create motion components
  const MotionBox = motion.create(Box);
  const MotionDetailContainer = motion.create(DetailContainer);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop for mobile */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: theme.zIndex.drawer - 1,
              display: { md: 'none' },
            }}
          />

          {/* Detail Panel */}
          <MotionDetailContainer
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            elevation={0}
          >
            {/* Header */}
            <DetailHeader>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: 'grey.900',
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 13,
                      color: 'grey.600',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {actions}
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ color: 'grey.500' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DetailHeader>

            {/* Content */}
            <DetailContent>
              {sections.map((section, index) => (
                <Section key={index}>
                  {section.title && (
                    <SectionTitle>{section.title}</SectionTitle>
                  )}
                  {section.content}
                </Section>
              ))}
              {children}
            </DetailContent>
          </MotionDetailContainer>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper components for consistent styling
IPadDetailView.Section = function DetailSection({ title, children, ...props }) {
  return (
    <Section {...props}>
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </Section>
  );
};

IPadDetailView.Field = function DetailField({ label, value, ...props }) {
  return (
    <Box sx={{ mb: 2 }} {...props}>
      <Typography
        variant="caption"
        sx={{
          fontSize: 13,
          color: 'grey.600',
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          color: 'grey.900',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default IPadDetailView;
