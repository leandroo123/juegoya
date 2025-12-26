import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
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

  // Verify user is the organizer
  const { data: match } = await supabase
    .from('matches')
    .select('organizer_id')
    .eq('id', id)
    .single()

  if (!match || (match as { organizer_id: string }).organizer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete the match
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)
    .eq('organizer_id', user.id) // Double check for security

  if (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
