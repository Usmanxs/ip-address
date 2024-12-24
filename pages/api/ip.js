import geoip from 'geoip-lite';

export default function handler(req, res) {
  try {
    // Get the IP address from query parameters, headers, or fallback
    const ip =
      req.query.ip || // Check for IP in the query string
      req.headers['x-forwarded-for']?.split(',')[0] || // Proxies may include this
      req.connection.remoteAddress; // Fallback to direct connection IP

    // Validate the IP
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required.' });
    }

    // Perform a lookup using geoip-lite
    const geo = geoip.lookup(ip);

    // Handle cases where geoip-lite does not have information for the IP
    if (!geo) {
      return res.status(404).json({
        error: 'Geolocation data not found for the provided IP.',
      });
    }
     

    // Return the geolocation information
    res.status(200).json({
      ip, // The requested IP address
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
      country: geo.country || 'Unknown',
      latitude: geo.ll?.[0] || 'Unknown',
      longitude: geo.ll?.[1] || 'Unknown',
      timezone: geo.timezone || 'Unknown',
      range: geo.range || 'Unknown', // Numeric range of IPs
      area: geo.area || 'Unknown',   // Approximate area code (if available)

    });
  } catch (error) {
    console.error('Error in GeoIP API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
