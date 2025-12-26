import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is signed up for this match
  const { data: participation } = await supabase
    .from('match_players')
    .select('*')
    .eq('match_id', id)
    .eq('user_id', user.id)
    .eq('role', 'signed_up')
    .is('canceled_at', null)
    .single()

  if (!participation) {
    return NextResponse.json({ error: 'Not signed up for this match' }, { status: 403 })
  }

  // Update confirmed_at
  const { error } = await supabase
    .from('match_players')
    .update({ confirmed_at: new Date().toISOString() } as any)
    .eq('match_id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error confirming attendance:', error)
    return NextResponse.json({ error: 'Failed to confirm attendance' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
