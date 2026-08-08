"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n, useT } from "@/components/i18n-provider";
import { directionForLocale } from "@/i18n/routing";
import { BreathingSession } from "@/components/mindfulness/session";
import { ProgramBanner } from "@/components/mindfulness/program-banner";

export type ExerciseType =
  | "one_minute"
  | "three_minute"
  | "calm_down"
  | "sleep";

type Exercise = {
  type: ExerciseType;
  titleKey: string;
  minutes: number;
  pattern: { inhale: number; hold: number; exhale: number };
  cardClassName: string;
  illustration: string;
  glowColor: string;
};

type StreakResponse = {
  streak: number;
  recommendedExerciseType: ExerciseType;
};

const illustrationStyle: React.CSSProperties = {
  filter: "brightness(1.04) contrast(1.03) saturate(1.05)",
  imageRendering: "auto",
};

export function MindfulnessPage() {
  const t = useT();
  const { locale } = useI18n();
  const isRtl = directionForLocale(locale) === "rtl";
  const [active, setActive] = useState<Exercise | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const [recommendedType, setRecommendedType] = useState<ExerciseType | null>(null);
  const [hasProgram, setHasProgram] = useState(false);

  const exercises = useMemo<Exercise[]>(
    () => [
      {
        type: "one_minute",
        titleKey: "mindfulness.exercises.oneMinute",
        minutes: 1,
        pattern: { inhale: 4, hold: 1, exhale: 5 },
        cardClassName:
          "bg-[linear-gradient(to_top,#f4a261_0%,#f8c28f_35%,#fde7cf_65%,#ffffff_100%)]",
        illustration: "/images/cloud-illustration.png",
        glowColor: "rgba(255,175,80,0.22)",
      },
      {
        type: "three_minute",
        titleKey: "mindfulness.exercises.threeMinute",
        minutes: 3,
        pattern: { inhale: 4, hold: 2, exhale: 6 },
        cardClassName:
          "bg-[linear-gradient(to_top,#C49FFF_0%,#D8BCFF_38%,#EEE3FF_68%,#FFFFFF_100%)]",
        illustration: "/images/cloud-3min-illustration.png",
        glowColor: "rgba(175,140,255,0.22)",
      },
      {
        type: "calm_down",
        titleKey: "mindfulness.exercises.calmDown",
        minutes: 2,
        pattern: { inhale: 4, hold: 2, exhale: 6 },
        cardClassName:
          "bg-[linear-gradient(to_top,#FF9CB6_0%,#FFC2D2_38%,#FFE4EC_68%,#FFFFFF_100%)]",
        illustration: "/images/heart-illustration.png",
        glowColor: "rgba(255,130,165,0.22)",
      },
      {
        type: "sleep",
        titleKey: "mindfulness.exercises.sleep",
        minutes: 4,
        pattern: { inhale: 4, hold: 3, exhale: 7 },
        cardClassName:
          "bg-[linear-gradient(to_top,#82CEF9_0%,#A8DDFB_38%,#D9F1FF_68%,#FFFFFF_100%)]",
        illustration: "/images/moon-illustration.png",
        glowColor: "rgba(110,185,255,0.22)",
      },
    ],
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/patient/mindfulness/streak");
        if (!res.ok) return;
        const data = (await res.json()) as StreakResponse;
        if (cancelled) return;
        setStreak(data.streak);
        setRecommendedType(data.recommendedExerciseType);
      } catch {
        // ignore
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/patient/program")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { hasAssignment?: boolean } | null) => {
        if (!cancelled && json?.hasAssignment) setHasProgram(true);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recommendedExercise = useMemo(() => {
    if (!recommendedType) return null;
    return exercises.find((e) => e.type === recommendedType) ?? null;
  }, [exercises, recommendedType]);

  return (
    <div className="space-y-6">
      <ProgramBanner />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {t("mindfulness.recommended.title")}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {recommendedExercise
                ? t("mindfulness.recommended.subtitle", {
                    exercise: t(recommendedExercise.titleKey),
                  })
                : t("mindfulness.recommended.subtitleFallback")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="whitespace-nowrap">
              {t("mindfulness.streak", { days: streak ?? 0 })}
            </Badge>
            {recommendedExercise ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setActive(recommendedExercise)}
              >
                {t("mindfulness.start")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {t("mindfulness.title")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("mindfulness.subtitle")}
        </p>
        {hasProgram ? (
          <Link
            href="/patient/program"
            className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            {t("mindfulness.alsoProgram")}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exercises.map((ex) => (
          <Card
            key={ex.type}
            className="overflow-hidden rounded-2xl border border-border/50"
          >
            <CardContent
              className={`relative flex min-h-[180px] items-center p-0 sm:min-h-[200px] ${ex.cardClassName}`}
            >
              {/* Radial glow behind illustration */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle at ${isRtl ? "22%" : "78%"} 45%, ${ex.glowColor}, transparent 52%)`,
                }}
                aria-hidden="true"
              />

              {/* Text content — inline-start side (mirrors under RTL) */}
              <div className="relative z-10 flex w-[54%] flex-col gap-3 p-6 sm:w-[52%]">
                <div>
                  <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
                    {t(ex.titleKey)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {t("mindfulness.duration", { minutes: ex.minutes })}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-fit"
                  onClick={() => setActive(ex)}
                >
                  {t("mindfulness.start")}
                </Button>
              </div>

              {/* Illustration — inline-end side (mirrors under RTL) */}
              <div
                className="pointer-events-none absolute bottom-0 end-0 top-0 flex w-[48%] items-center justify-center sm:w-[50%]"
                aria-hidden="true"
              >
                <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] lg:h-[280px] lg:w-[280px]">
                  <Image
                    src={ex.illustration}
                    alt=""
                    fill
                    className="object-contain"
                    style={illustrationStyle}
                    priority={ex.type === "one_minute"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {active ? (
        <BreathingSession
          exerciseType={active.type}
          durationSeconds={active.minutes * 60}
          pattern={active.pattern}
          title={t(active.titleKey)}
          onClose={() => setActive(null)}
        />
      ) : null}
    </div>
  );
}
