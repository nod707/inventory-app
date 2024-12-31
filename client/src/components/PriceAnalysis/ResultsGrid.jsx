import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Link,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '100%', // 1:1 aspect ratio
  backgroundSize: 'contain',
});

const PlatformChip = styled(Chip)(({ platform, theme }) => {
  const platformColors = {
    poshmark: '#FF2F74',
    therealreal: '#000000',
    ebay: '#0064D2',
    mercari: '#FF2D55',
  };

  return {
    backgroundColor: platformColors[platform] || theme.palette.primary.main,
    color: '#ffffff',
    fontWeight: 'bold',
  };
});

const ResultsGrid = ({ results }) => {
  // Group results by platform
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.platform]) {
      acc[item.platform] = [];
    }
    acc[item.platform].push(item);
    return acc;
  }, {});

  // Get top 10 results from each platform
  const platforms = Object.keys(groupedResults);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {platforms.map((platform) => (
        <Box key={platform} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PlatformChip
              label={platform.toUpperCase()}
              platform={platform}
              size="small"
            />
            <Typography variant="h6" sx={{ ml: 2 }}>
              {groupedResults[platform].length} Results
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {groupedResults[platform].slice(0, 10).map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <StyledCard>
                  <StyledCardMedia
                    image={item.imageUrl}
                    title={item.title}
                  />
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="subtitle1"
                      component="div"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        height: '3em',
                        lineHeight: '1.5em',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                      {item.originalPrice && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${item.originalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    {item.condition && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Condition: {item.condition}
                      </Typography>
                    )}
                    {item.shipping && (
                      <Typography variant="body2" color="text.secondary">
                        Shipping: {item.shipping}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Link
                        href={item.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                        underline="hover"
                      >
                        View Listing
                      </Link>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ mt: 4 }} />
        </Box>
      ))}
    </Box>
  );
};

export default ResultsGrid;
