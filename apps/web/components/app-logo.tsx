import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoImage({
  className,
}: {
  className?: string;
}) {
  return (
    <Image
      src="/images/favicon/logoAITHINKDESIGN.svg"
      alt="AITHINKDESIGN"
      width={150}
      height={40}
      className={cn('h-8 w-auto lg:h-10', className)}
      priority
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'AITHINKDESIGN Home'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}
