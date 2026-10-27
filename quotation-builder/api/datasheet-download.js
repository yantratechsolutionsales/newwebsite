export default async function handler(req, res) {
  const { url, name } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const targetUrl = decodeURIComponent(url);
    const fetchResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!fetchResponse.ok) {
      return res.status(fetchResponse.status).json({ error: `Failed to fetch remote datasheet: ${fetchResponse.statusText}` });
    }

    const contentType = fetchResponse.headers.get('content-type') || 'application/pdf';
    const cleanFileName = (name ? decodeURIComponent(name) : 'Technical_Datasheet.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    const arrayBuffer = await fetchResponse.arrayBuffer();
    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error while downloading datasheet' });
  }
}
