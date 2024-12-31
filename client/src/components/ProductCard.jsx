import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  CardActionArea,
  CardActions,
  Collapse,
  styled,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Straighten as StraightenIcon,
  LocalOffer as LocalOfferIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const ExpandMoreStyled = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

import CrossPostDialog from './marketplace/CrossPostDialog';

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [crossPostOpen, setCrossPostOpen] = useState(false);

  const handleExpandClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const formatMeasurement = (value) => {
    return value ? `${parseFloat(value).toFixed(1)}"` : 'N/A';
  };

  const renderMeasurements = () => {
    const measurements = product.measurements || {};
    return (
      <Grid container spacing={1}>
        {Object.entries(measurements).map(([key, value]) => (
          <Grid item xs={6} key={key}>
            <Typography variant="body2" color="text.secondary">
              {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
              <Box component="span" fontWeight="medium">
                {formatMeasurement(value)}
              </Box>
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <StyledCard>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image={product.images[0] || '/placeholder.jpg'}
          alt={product.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography gutterBottom variant="h6" component="div" noWrap>
              {product.brand} {product.style}
            </Typography>
            <Chip
              label={`$${product.price}`}
              color="primary"
              size="small"
              icon={<LocalOfferIcon />}
            />
          </Box>
          
          <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
            {product.hashtags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <Typography variant="body2" color="text.secondary" noWrap>
            {product.description}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions disableSpacing>
        <Tooltip title="Edit">
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cross-Post">
          <IconButton onClick={(e) => {
            e.stopPropagation();
            setCrossPostOpen(true);
          }}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Measurements">
          <ExpandMoreStyled
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show measurements"
          >
            <StraightenIcon />
          </ExpandMoreStyled>
        </Tooltip>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Measurements
          </Typography>
          {renderMeasurements()}
        </CardContent>
      </Collapse>
      <CrossPostDialog
        open={crossPostOpen}
        onClose={() => setCrossPostOpen(false)}
        product={product}
      />
    </StyledCard>
  );
};

export default ProductCard;
