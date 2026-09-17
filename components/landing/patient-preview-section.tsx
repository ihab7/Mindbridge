import { IconAlertTriangle, IconFileDescription } from "@tabler/icons-react"
import { getServerI18n } from "@/lib/server-i18n"
import { Reveal } from "./reveal"
import { AnimatedCurve } from "./animated-curve"

/**
 * One framed screen, no practitioner sidebar: the hero already shows the
 * dashboard shell, and repeating it here would make the two sections look
 * like the same screenshot twice.
 */
export async function PatientPreviewSection() {
  const { t } = await getServerI18n()

  const metrics = [
    { label: t("landing.pm.mood"), value: "7,2/10" },
    { label: t("landing.pm.anxiety"), value: "3,1/10" },
    { label: t("landing.pm.sleep"), value: "7h24" },
    { label: t("landing.pm.adherence"), value: "92%" },
  ]

  return (
    <section className="px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto w-full max-w-[860px]">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
              {t("landing.preview.badge")}
            </span>
            <h2 className="mb-8 mt-4 text-2xl font-bold tracking-[-0.02em] text-foreground md:text-[30px]">
              {t("landing.preview.title")}
            </h2>
          </div>
        </Reveal>

        <Reveal delayMs={80}>
          <div className="overflow-hidden rounded-[14px] border-[0.5px] border-border" aria-hidden="true">
            <div className="flex items-center gap-3 border-b-[0.5px] border-border px-[18px] py-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/[0.12] text-[11px] font-semibold text-primary">
                AB
              </span>
              <div>
                <p className="text-[13px] font-medium text-foreground">Ahmed Ben Ali</p>
                <p className="text-[10.5px] text-muted-foreground">{t("landing.preview.followedSince")}</p>
              </div>
            </div>

            <div className="grid min-[700px]:grid-cols-[1.3fr_1fr]">
              <div className="border-b-[0.5px] border-border px-[18px] py-4 min-[700px]:border-b-0 min-[700px]:border-e-[0.5px]">
                <div className="grid grid-cols-4 gap-2">
                  {metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[9px] leading-none text-muted-foreground">{m.label}</p>
                      <p className="mt-1.5 text-sm font-medium leading-none text-foreground">{m.value}</p>
                    </div>
                  ))}
                </div>

                <AnimatedCurve
                  viewBox="0 0 300 44"
                  d="M6 38 L78 31 L150 24 L222 14 L294 6"
                  className="mt-4 h-11 w-full"
                  strokeWidth={2}
                  points={[
                    [6, 38],
                    [78, 31],
                    [150, 24],
                    [222, 14],
                    [294, 6],
                  ]}
                />
              </div>

              <div className="flex flex-col justify-center gap-3 px-[18px] py-4">
                <div className="flex items-start gap-2">
                  <IconAlertTriangle
                    size={15}
                    stroke={1.75}
                    className="mt-px shrink-0"
                    style={{ color: "hsl(var(--accent))" }}
                  />
                  <p className="text-[11px] leading-snug text-foreground">{t("landing.preview.alertSleep")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <IconFileDescription
                    size={15}
                    stroke={1.75}
                    className="mt-px shrink-0"
                    style={{ color: "hsl(var(--tint-violet))" }}
                  />
                  <p className="text-[11px] leading-snug text-foreground">{t("landing.preview.reportReady")}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
