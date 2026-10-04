export default function handler(req,res) {
  // Public browser map key; never include Supabase service credentials here.
  res.setHeader('Cache-Control','public, s-maxage=60');
  res.status(200).json({cartoKey:process.env.CARTO_BASEMAP_KEY || null});
}
