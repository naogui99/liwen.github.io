// api/delete.js
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const errorData = await response.json().catch(() => ({}));
      res.status(500).json({ error: 'Delete failed', message: errorData.message || 'Unknown error' });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Network error', message: err.message });
  }
}