import { memo } from 'react';
import { AVATAR_ICONS } from '@/lib/avatarIcons';

interface Props {
  iconKey: string | null | undefined;
  size?: number;
  className?: string;
}

const AvatarIcon = memo(function AvatarIcon({ iconKey, size = 18, className = '' }: Props) {
  if (!iconKey || !(iconKey in AVATAR_ICONS)) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      {AVATAR_ICONS[iconKey].node}
    </svg>
  );
});

export default AvatarIcon;
