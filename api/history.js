// api/history.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'POST':
        // 保存记录
        const { data, error } = await supabase
          .from('assessments')
          .insert([body])
          .select();
        if (error) throw error;
        return res.status(200).json({ success: true, id: data[0].id });

      case 'GET':
        // 获取列表
        const { page = 1, limit = 10 } = query;
        const from = (page - 1) * limit;
        const { data: records, count } = await supabase
          .from('assessments')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, from + parseInt(limit) - 1);
        return res.status(200).json({
          records,
          totalPages: Math.ceil(count / limit)
        });

      case 'DELETE':
        // 删除记录
        const { id } = query;
        const { error: delError } = await supabase
          .from('assessments')
          .delete()
          .eq('id', id);
        if (delError) throw delError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}