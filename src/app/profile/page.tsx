import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/actions';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/profile');

  const profile = await getProfile(user.id);
  if (!profile) redirect('/');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const usedThisMonth =
    profile.name_change_month === currentMonth ? profile.name_changes_this_month : 0;

  return (
    <ProfileClient
      userId={user.id}
      initialUsername={profile.username}
      initialEmoji={profile.avatar_emoji ?? '✝️'}
      nameChangesUsed={usedThisMonth}
    />
  );
}
