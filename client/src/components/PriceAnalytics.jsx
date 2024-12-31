import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon
} from '@mui/icons-material';

const PriceAnalytics = ({ listings }) => {
  const theme = useTheme();

  const analytics = useMemo(() => {
    if (!listings || !Object.keys(listings).length) return null;

    // Combine all listings
    const allListings = Object.values(listings).flat();
    
    // Clean and parse prices
    const prices = allListings.map(item => ({
      ...item,
      numericPrice: parseFloat(item.price.replace(/[^0-9.]/g, ''))
    })).filter(item => !isNaN(item.numericPrice));

    if (!prices.length) return null;

    // Basic statistics
    const sortedPrices = prices.map(p => p.numericPrice).sort((a, b) => a - b);
    const total = sortedPrices.reduce((sum, price) => sum + price, 0);
    const count = sortedPrices.length;
    const mean = total / count;
    const median = count % 2 === 0
      ? (sortedPrices[count/2 - 1] + sortedPrices[count/2]) / 2
      : sortedPrices[Math.floor(count/2)];
    
    // Price distribution
    const min = Math.min(...sortedPrices);
    const max = Math.max(...sortedPrices);
    const range = max - min;
    const bucketSize = range / 10;
    
    const distribution = Array(10).fill(0).map((_, i) => {
      const bucketMin = min + (i * bucketSize);
      const bucketMax = bucketMin + bucketSize;
      const count = prices.filter(p => 
        p.numericPrice >= bucketMin && p.numericPrice < bucketMax
      ).length;
      return {
        range: `$${bucketMin.toFixed(0)}-${bucketMax.toFixed(0)}`,
        count
      };
    });

    // Platform comparison
    const platformStats = Object.entries(listings).map(([platform, items]) => {
      const platformPrices = items
        .map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')))
        .filter(price => !isNaN(price));
      
      if (!platformPrices.length) return null;

      const platformTotal = platformPrices.reduce((sum, price) => sum + price, 0);
      return {
        platform,
        average: platformTotal / platformPrices.length,
        min: Math.min(...platformPrices),
        max: Math.max(...platformPrices),
        count: platformPrices.length
      };
    }).filter(Boolean);

    // Calculate market insights
    const standardDeviation = Math.sqrt(
      sortedPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / count
    );

    const outliers = prices.filter(item => 
      Math.abs(item.numericPrice - mean) > 2 * standardDeviation
    );

    const potentialDeals = prices
      .filter(item => item.numericPrice < median * 0.8)
      .sort((a, b) => a.numericPrice - b.numericPrice);

    return {
      basic: {
        mean,
        median,
        min,
        max,
        count,
        standardDeviation
      },
      distribution,
      platformStats,
      outliers,
      potentialDeals
    };
  }, [listings]);

  if (!analytics) return null;

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" color={color || 'primary'}>
          ${value.toFixed(2)}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Price Analytics
      </Typography>

      {/* Basic Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Price"
            value={analytics.basic.mean}
            subtitle={`Based on ${analytics.basic.count} listings`}
            icon={<TrendingUpIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Median Price"
            value={analytics.basic.median}
            subtitle="Middle market price"
            icon={<RemoveCircleOutlineIcon color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lowest Price"
            value={analytics.basic.min}
            subtitle="Best deal available"
            icon={<TrendingDownIcon color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Highest Price"
            value={analytics.basic.max}
            subtitle="Premium pricing"
            icon={<TrendingUpIcon color="error" />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Price Distribution Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Price Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Platform Comparison */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Platform Comparison
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.platformStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke={theme.palette.primary.main} 
                  name="Average Price"
                />
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  stroke={theme.palette.success.main} 
                  name="Lowest Price"
                />
                <Line 
                  type="monotone" 
                  dataKey="max" 
                  stroke={theme.palette.error.main} 
                  name="Highest Price"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Market Insights
          </Typography>
          
          <Grid container spacing={3}>
            {/* Potential Deals */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Potential Deals (20% below median)
              </Typography>
              {analytics.potentialDeals.slice(0, 5).map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    ${item.numericPrice.toFixed(2)} - {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from {item.source.marketplace}
                  </Typography>
                </Box>
              ))}
            </Grid>

            {/* Price Outliers */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" color="error" gutterBottom>
                Price Outliers (2+ standard deviations)
              </Typography>
              {analytics.outliers.slice(0, 5).map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    ${item.numericPrice.toFixed(2)} - {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from {item.source.marketplace}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriceAnalytics;
