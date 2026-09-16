import { getServerI18n } from "@/lib/server-i18n"
import { Reveal } from "./reveal"
import { Timeline } from "./timeline"
import { PatientMockup } from "./patient-mockup"

export async function HelpSection() {
  const { t } = await getServerI18n()

  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`landing.help.step${n}.title`),
    desc: t(`landing.help.step${n}.desc`),
  }))

  return (
    <section className="bg-primary/[0.04] px-5 py-16 md:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="grid items-center gap-12 min-[900px]:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                {t("landing.help.badge")}
              </span>
              <h2 className="mb-3 mt-3.5 text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-foreground md:text-[30px]">
                {t("landing.help.titleLine1")}
                <br />
                {t("landing.help.titleLine2")}
              </h2>
              <p className="mb-8 max-w-[380px] text-[13.5px] leading-[1.7] text-muted-foreground">
                {t("landing.help.paragraph")}
              </p>

              <Timeline steps={steps} />
            </div>
          </Reveal>

          {/* Extra bottom room so the overlapping mobile card, which sits 26px
              below the window, is not clipped by the section padding. */}
          <div className="pb-8 min-[900px]:pb-10">
            <PatientMockup
              strings={{
                practitioner: t("landing.pm.practitioner"),
                patientBadge: t("landing.pm.patientBadge"),
                followedSince: t("landing.pm.followedSince"),
                mood: t("landing.pm.mood"),
                anxiety: t("landing.pm.anxiety"),
                sleep: t("landing.pm.sleep"),
                adherence: t("landing.pm.adherence"),
                chartTitle: t("landing.pm.chartTitle"),
                attention: t("landing.pm.attention"),
                alert: t("landing.pm.alert"),
                seeDetails: t("landing.pm.seeDetails"),
                currentState: t("landing.pm.currentState"),
                seeReport: t("landing.pm.seeReport"),
                navDashboard: t("nav.dashboard"),
                navPatients: t("nav.patients"),
                navAlerts: t("nav.alerts"),
                navMessages: t("nav.messages"),
                navSettings: t("nav.settings"),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
