import {
  HomeCredits,
  HomeCta,
  HomeKicker,
  type HomeCredit,
} from '@/components/home/home-credits';
import { HomeSpotRoot, HomeStill } from '@/components/home/home-spot-root';
import { WorkFrame } from '@/components/ui/work-frame';

type DialogueSide = {
  title: string;
  meta?: string;
  src?: string | null;
  workHref?: string | null;
  credits?: HomeCredit[];
};

type HomeDialogueSpotProps = {
  kicker: string;
  roomHref?: string;
  title: string;
  lede: string;
  left: DialogueSide;
  right: DialogueSide;
  cta: string;
  href?: string | null;
};

function Side({ side }: { side: DialogueSide }) {
  return (
    <div className="min-w-0">
      <HomeStill href={side.workHref}>
        <WorkFrame
          src={side.src}
          alt={side.title}
          fit="cover"
          className="h-64 w-full"
        />
      </HomeStill>
      <p className="mt-2 truncate text-center font-serif text-base">
        {side.title}
      </p>
      {side.credits && side.credits.length > 0 ? (
        <p className="mt-0.5 flex justify-center">
          <HomeCredits
            credits={side.credits}
            className="justify-center font-serif text-sm"
          />
        </p>
      ) : side.meta ? (
        <p className="mt-0.5 text-center font-serif text-sm opacity-70">
          {side.meta}
        </p>
      ) : null}
    </div>
  );
}

export function HomeDialogueSpot({
  kicker,
  roomHref = '/dialogue',
  title,
  lede,
  left,
  right,
  cta,
  href = '/dialogue',
}: HomeDialogueSpotProps) {
  return (
    <article>
      <HomeSpotRoot spot="dialogue" className="flex min-w-0 flex-col">
        <div className="grid grid-cols-2 gap-1">
          <Side side={left} />
          <Side side={right} />
        </div>
        <HomeKicker href={roomHref} className="mt-3">
          {kicker}
        </HomeKicker>
        <h2 className="mt-1 font-serif text-2xl leading-tight tracking-wide md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 font-sans text-base leading-relaxed opacity-70">
          {lede}
        </p>
        <HomeCta href={href}>{cta}</HomeCta>
      </HomeSpotRoot>
    </article>
  );
}
