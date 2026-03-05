// api/get.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase config missing' });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/assessments?id=eq.${encodeURIComponent(id)}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const data = await response.json();
    if (data.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Get error:', err);
    res.status(500).json({ error: 'Fetch failed', message: err.message });
  }
}