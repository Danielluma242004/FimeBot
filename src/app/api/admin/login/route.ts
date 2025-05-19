import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Busca el usuario
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, email, password')
    .eq('email', email)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  // Comparación simple (solo para pruebas, usa hash en producción)
  if (data.password !== password) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  // Genera una sesión simple (puedes usar JWT en producción)
  return NextResponse.json({ success: true });
}