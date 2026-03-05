// api/list.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase config missing' });
  }

  try {
    // 获取记录列表
    const listRes = await fetch(
      `${supabaseUrl}/rest/v1/assessments?select=*&order=timestamp.desc&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const records = await listRes.json();

    // 获取总条数
    const countRes = await fetch(
      `${supabaseUrl}/rest/v1/assessments?select=count(*)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );
    const countData = await countRes.json();
    const totalCount = parseInt(countData[0]?.count || 0);

    res.status(200).json({
      records,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: 'Fetch failed', message: err.message });
  }
}