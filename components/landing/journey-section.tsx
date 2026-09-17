import { IconUser, IconChartLine, IconEye, IconCalendarCheck } from "@tabler/icons-react"
import { getServerI18n } from "@/lib/server-i18n"
import { Reveal } from "./reveal"

const ICONS = [IconUser, IconChartLine, IconEye, IconCalendarCheck]

/**
 * Isolated in a tinted box, unlike the feature list which sits on the page
 * background — that contrast is what keeps the two sections from reading as
 * one long scroll of the same thing.
 */
export async function JourneySection() {
  const { t } = await getServerI18n()

  return (
    <section className="px-5 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <Reveal>
          <div className="rounded-2xl bg-card px-7 py-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                {t("landing.journey.badge")}
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[30px]">
                {t("landing.journey.title")}
              </h2>
            </div>

            <div className="relative mt-10">
              {/* Connector sits behind the circles and stops short of the
                  first and last one. Centred on the 44px circles (top 22px),
                  and symmetric, so it needs no RTL handling. */}
              <div
                className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px bg-border min-[700px]:block"
                aria-hidden="true"
              />

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 min-[700px]:grid-cols-4">
                {[1, 2, 3, 4].map((n, index) => {
                  const Icon = ICONS[index]
                  return (
                    <div key={n} className="relative z-[1] flex flex-col items-center text-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-primary bg-card">
                        <Icon size={19} stroke={1.75} className="text-primary" />
                      </span>
                      <p className="mt-3 text-[11.5px] font-medium text-foreground">
                        {n}. {t(`landing.journey.step${n}.title`)}
                      </p>
                      <p className="mt-1 max-w-[150px] text-[10px] leading-[1.4] text-muted-foreground">
                        {t(`landing.journey.step${n}.desc`)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
