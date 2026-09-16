import Link from "next/link"
import { IconHeartHandshake, IconArrowRight, IconArrowLeft } from "@tabler/icons-react"
import { getServerI18n } from "@/lib/server-i18n"
import { directionForLocale, isLocale } from "@/i18n/routing"
import { Reveal } from "./reveal"

export async function CtaBanner() {
  const { t, locale } = await getServerI18n()
  const rtl = directionForLocale(isLocale(locale) ? locale : "fr") === "rtl"
  const ArrowForward = rtl ? IconArrowLeft : IconArrowRight

  return (
    <section className="px-5 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-7 rounded-2xl border-[0.5px] border-primary/15 bg-primary/[0.06] px-9 py-8">
            <div className="flex items-center gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <IconHeartHandshake size={26} stroke={1.75} className="text-primary" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t("landing.cta.title")}</h2>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{t("landing.cta.subtitle")}</p>
              </div>
            </div>

            <div>
              <Link
                href="/register"
                className="liftOnHover pressable inline-flex items-center gap-2 rounded-full bg-primary px-7 py-[15px] text-[14.5px] font-medium text-primary-foreground transition-all duration-[180ms] ease-[cubic-bezier(.34,1.4,.64,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_hsl(var(--primary)/0.32)] active:scale-[0.97]"
              >
                {t("landing.cta.button")}
                <ArrowForward size={16} stroke={2} />
              </Link>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">{t("landing.cta.noCard")}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
