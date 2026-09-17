import {
  IconClipboardHeart,
  IconChartLine,
  IconBell,
  IconMessageCircle,
  IconRoute,
  IconMoonStars,
} from "@tabler/icons-react"
import { getServerI18n } from "@/lib/server-i18n"
import { Reveal } from "./reveal"

/**
 * Editorial numbered list, deliberately not a card grid: sections 3-6 each
 * use a different layout so they don't read as the same block repeated.
 * One tint per row — teal twice, then blue, violet, the theme's amber and
 * magenta. They stay confined to these 20px glyphs.
 */
const ROWS = [
  { n: "01", Icon: IconClipboardHeart, tint: "--primary", key: "checkin" },
  { n: "02", Icon: IconChartLine, tint: "--tint-blue", key: "evolution" },
  { n: "03", Icon: IconBell, tint: "--tint-violet", key: "signals" },
  { n: "04", Icon: IconMessageCircle, tint: "--primary", key: "messaging" },
  { n: "05", Icon: IconRoute, tint: "--accent", key: "programs" },
  { n: "06", Icon: IconMoonStars, tint: "--tint-magenta", key: "stories" },
] as const

export async function FeaturesSection() {
  const { t } = await getServerI18n()

  return (
    <section id="features" className="scroll-mt-20 px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[860px]">
        <Reveal>
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
              {t("landing.feat.badge")}
            </span>
            <h2 className="mb-2.5 mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[30px]">
              {t("landing.feat.title")}
            </h2>
            <p className="max-w-[560px] text-sm text-muted-foreground">{t("landing.feat.subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-10">
          {ROWS.map(({ n, Icon, tint, key }, index) => (
            <Reveal key={key} delayMs={index * 60}>
              <div
                className={`flex gap-4 border-t-[0.5px] border-border py-4 ${
                  index === ROWS.length - 1 ? "border-b-[0.5px]" : ""
                }`}
              >
                <span className="w-7 shrink-0 text-xl font-medium leading-tight text-muted-foreground">{n}</span>
                <Icon
                  size={20}
                  stroke={1.75}
                  className="mt-0.5 shrink-0"
                  style={{ color: `hsl(var(${tint}))` }}
                />
                <div>
                  <h3 className="text-[13.5px] font-medium text-foreground">{t(`landing.feat.${key}.title`)}</h3>
                  <p className="mt-1 text-xs leading-[1.55] text-muted-foreground">
                    {t(`landing.feat.${key}.desc`)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
