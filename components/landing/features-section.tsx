import {
  IconActivity,
  IconChartBar,
  IconBell,
  IconMessageCircle,
  IconShieldCheck,
  IconFileDescription,
} from "@tabler/icons-react"
import { getServerI18n } from "@/lib/server-i18n"
import { Reveal } from "./reveal"

/**
 * Per-card icon tints. Teal is the theme's `primary`; amber is the theme's
 * `accent` (38 92% 50%), which is exactly the reference's amber, so no
 * hardcoded value is needed for it. Blue and violet have no token and come
 * from --tint-* custom properties declared on the landing wrapper, where the
 * dark theme lightens them.
 */
const CARDS = [
  { icon: IconActivity, tint: "--primary", key: "journal" },
  { icon: IconChartBar, tint: "--tint-blue", key: "analytics" },
  { icon: IconBell, tint: "--tint-violet", key: "signals" },
  { icon: IconMessageCircle, tint: "--primary", key: "messaging" },
  { icon: IconShieldCheck, tint: "--accent", key: "roles" },
  { icon: IconFileDescription, tint: "--primary", key: "reports" },
] as const

export async function FeaturesSection() {
  const { t } = await getServerI18n()

  return (
    <section id="features" className="scroll-mt-20 px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[1200px]">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
              {t("landing.feat.badge")}
            </span>
            <h2 className="mb-2.5 mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[30px]">
              {t("landing.feat.title")}
            </h2>
            <p className="mx-auto max-w-[520px] text-sm text-muted-foreground">
              {t("landing.feat.subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
          {CARDS.map(({ icon: Icon, tint, key }, index) => (
            <Reveal key={key} delayMs={index * 60}>
              <div className="featureCard flex h-full gap-4 rounded-[14px] border-[0.5px] border-border bg-card p-[22px]">
                <span
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: `hsl(var(${tint}) / var(--tint-alpha))` }}
                >
                  <Icon size={22} stroke={1.75} style={{ color: `hsl(var(${tint}))` }} />
                </span>
                <div>
                  <h3 className="mb-1.5 text-[15px] font-semibold text-foreground">
                    {t(`landing.feat.${key}.title`)}
                  </h3>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">
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
