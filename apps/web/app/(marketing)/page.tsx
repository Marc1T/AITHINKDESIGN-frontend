import Image from 'next/image';
import Link from 'next/link';

import { ArrowRightIcon, Lightbulb, Users, Cpu, Target, Wrench, FileText } from 'lucide-react';

import {
  CtaButton,
  FeatureCard,
  FeatureGrid,
  FeatureShowcase,
  FeatureShowcaseIconContainer,
  Hero,
  Pill,
} from '@kit/ui/marketing';

import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-14'}>
      <div className={'container mx-auto'}>
        <Hero
          pill={
            <Pill label={'AI-Powered'}>
              <span>Design Thinking meets Artificial Intelligence</span>
            </Pill>
          }
          title={
            <>
              <span>Transform Ideas into</span>
              <span>Innovative Products</span>
            </>
          }
          subtitle={
            <span>
              AITHINKDESIGN combines AI-powered multi-agent collaboration with 
              Design Thinking methodology to accelerate your product design process.
            </span>
          }
          cta={<MainCallToActionButton />}
          image={
            <Image
              priority
              className={
                'dark:border-primary/10 rounded-2xl border border-gray-200'
              }
              width={3558}
              height={2222}
              src={`/images/dashboard.webp`}
              alt={`AITHINKDESIGN Workshop`}
            />
          }
        />
      </div>

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-col space-y-16 xl:space-y-32 2xl:space-y-36'}
        >
          <FeatureShowcase
            heading={
              <>
                <b className="font-semibold dark:text-white">
                  AI-Augmented Design Thinking
                </b>
                .{' '}
                <span className="text-muted-foreground font-normal">
                  6 phases powered by multi-agent AI to take your ideas from concept to specification.
                </span>
              </>
            }
            icon={
              <FeatureShowcaseIconContainer>
                <Lightbulb className="h-5" />
                <span>Complete Design Workflow</span>
              </FeatureShowcaseIconContainer>
            }
          >
            <FeatureGrid>
              <FeatureCard
                className={'relative col-span-2 overflow-hidden'}
                label={'Multi-Agent Ideation'}
                description={`AI agents with unique personalities collaborate to generate diverse and creative ideas using techniques like SCAMPER, Random Word, and Worst Idea.`}
              />

              <FeatureCard
                className={
                  'relative col-span-2 w-full overflow-hidden lg:col-span-1'
                }
                label={'Empathy & Framing'}
                description={`Build empathy maps, customer journeys, and How Might We questions to deeply understand user needs.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Smart Convergence'}
                description={`Dot voting, Now-How-Wow matrix, and Impact/Effort analysis to select the best ideas.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'TRIZ Innovation'}
                description={`Apply TRIZ methodology to overcome contradictions and enhance your concepts with inventive principles.`}
              />

              <FeatureCard
                className={'relative col-span-2 overflow-hidden lg:col-span-1'}
                label={'Automatic Specifications'}
                description={`Generate comprehensive product specifications (Cahier des Charges) automatically from your refined ideas.`}
              />
            </FeatureGrid>
          </FeatureShowcase>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <CtaButton>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>Start Designing</span>

            <ArrowRightIcon
              className={
                'animate-in fade-in slide-in-from-left-8 h-4' +
                ' zoom-in fill-mode-both delay-1000 duration-1000'
              }
            />
          </span>
        </Link>
      </CtaButton>

      <CtaButton variant={'link'}>
        <Link href={'/auth/sign-in'}>
          Sign In
        </Link>
      </CtaButton>
    </div>
  );
}
