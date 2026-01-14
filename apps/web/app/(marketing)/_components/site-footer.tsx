import { Footer } from '@kit/ui/marketing';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';

export function SiteFooter() {
  return (
    <Footer
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      description="AI-powered product design platform. Design Thinking + AI to innovate faster."
      copyright={`© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.`}
      sections={[
        {
          heading: 'Get Started',
          links: [
            {
              href: '/auth/sign-in',
              label: 'Sign In',
            },
            {
              href: '/auth/sign-up',
              label: 'Sign Up',
            },
          ],
        },
        {
          heading: 'Product',
          links: [
            {
              href: '/faq',
              label: 'FAQ',
            },
          ],
        },
        {
          heading: 'Legal',
          links: [
            {
              href: '/terms-of-service',
              label: 'Terms of Service',
            },
            {
              href: '/privacy-policy',
              label: 'Privacy Policy',
            },
            {
              href: '/cookie-policy',
              label: 'Cookie Policy',
            },
          ],
        },
      ]}
    />
  );
}
