import type { LibrarySession, PlanEntry } from "./types"

/**
 * Flat, tagged library of every session available for the anxiety program.
 * Programs are COMPOSED from this library (by a practitioner, or by the AI
 * drafting a proposal for a practitioner to review) rather than hardcoded
 * into fixed weeks.
 *
 * The first 18 entries (ids `w1s1`..`w4s4`) are migrated unchanged in content
 * from the original 4-week fixed program (see `content.ts`) — same title,
 * learn paragraphs, why-this-works, affirmation, reflection question, and
 * breathing config, with selection metadata (category/tags/targets/etc.)
 * added on top. `DEFAULT_PROGRAM` below reproduces that original order, so
 * existing assignments and the AI-unavailable fallback both keep working.
 *
 * Arabic paragraphs for the 18 migrated sessions carry whatever review status
 * they had in the original file (weeks 1-2 were written directly in Arabic;
 * weeks 3-4 are marked first-pass). All 22 new sessions are first-pass Arabic
 * for `learn.paragraphs` and marked accordingly — everything else (title,
 * typeLabel, whyThisWorks, affirmation, reflection.question) is written
 * directly in all three languages.
 */
export const SESSION_LIBRARY: LibrarySession[] = [
  // ── Week 1 content, migrated: education + reflection ──────────────────
  {
    id: "w1s1",
    title: {
      en: "What anxiety really is",
      fr: "Ce qu'est vraiment l'anxiété",
      ar: "ما هو القلق فعلاً",
    },
    durationMin: 6,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Anxiety is not a flaw or a sign of weakness — it's a normal, protective response your body has used for thousands of years to keep you safe from danger.",
          "The trouble starts when that alarm goes off too often, or too loudly, in situations that aren't actually dangerous — a meeting, a crowded room, a quiet night alone with your thoughts.",
        ],
        fr: [
          "L'anxiété n'est pas un défaut ni un signe de faiblesse : c'est une réponse normale et protectrice que votre corps utilise depuis des milliers d'années pour vous garder à l'abri du danger.",
          "Le problème survient quand cette alarme se déclenche trop souvent, ou trop fort, dans des situations qui ne sont pas réellement dangereuses — une réunion, une pièce bondée, une soirée tranquille seul avec vos pensées.",
        ],
        ar: [
          "القلق ليس عيبًا ولا علامة ضعف، بل استجابة طبيعية وحمائية استخدمها جسمك منذ آلاف السنين لحمايتك من الخطر.",
          "تبدأ المشكلة عندما ينطلق هذا الإنذار كثيرًا، أو بصوت عالٍ جدًا، في مواقف ليست خطيرة فعلاً — اجتماع عمل، غرفة مزدحمة، أو ليلة هادئة وحيدًا مع أفكارك.",
        ],
      },
    },
    whyThisWorks: {
      en: "Understanding that anxiety is a normal biological response — not a personal failure — is the first step to working with it instead of against it.",
      fr: "Comprendre que l'anxiété est une réponse biologique normale — et non un échec personnel — est la première étape pour agir avec elle plutôt que contre elle.",
      ar: "فهم أن القلق استجابة بيولوجية طبيعية — وليس فشلاً شخصيًا — هو الخطوة الأولى للتعامل معه بدلاً من محاربته.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I am not broken. My body is only trying to protect me.",
      fr: "Je ne suis pas brisé·e. Mon corps essaie seulement de me protéger.",
      ar: "أنا لست معطوبًا. جسدي يحاول فقط حمايتي.",
    },
    reflection: {
      question: {
        en: "When did you first notice anxiety showing up for you? What was happening at the time?",
        fr: "Quand avez-vous remarqué l'anxiété pour la première fois ? Que se passait-il à ce moment-là ?",
        ar: "متى لاحظت القلق يظهر لديك لأول مرة؟ ماذا كان يحدث في ذلك الوقت؟",
      },
    },
    category: "education",
    tags: ["foundation", "psychoeducation"],
    targets: ["high_anxiety", "first_program"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },
  {
    id: "w1s2",
    title: {
      en: "Your body's alarm system",
      fr: "Le système d'alarme de votre corps",
      ar: "نظام الإنذار في جسمك",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "When your brain senses a threat, it triggers a cascade of changes: your heart beats faster, your muscles tense, your breathing quickens. This is your body's alarm system, sometimes called fight-or-flight.",
          "These physical sensations can feel frightening, especially when there's no obvious danger in front of you. But a racing heart during anxiety is not a sign that something is wrong with your body — it's a sign that your alarm system is doing exactly what it evolved to do.",
        ],
        fr: [
          "Quand votre cerveau perçoit une menace, il déclenche une cascade de changements : le cœur s'accélère, les muscles se tendent, la respiration devient plus rapide. C'est le système d'alarme de votre corps, parfois appelé réaction de lutte ou de fuite.",
          "Ces sensations physiques peuvent faire peur, surtout quand aucun danger évident n'est présent. Mais un cœur qui s'emballe pendant l'anxiété n'indique pas que votre corps a un problème — cela montre que votre système d'alarme fait exactement ce pour quoi il a évolué.",
        ],
        ar: [
          "عندما يستشعر دماغك تهديدًا، يطلق سلسلة من التغيرات: يتسارع قلبك، تتوتر عضلاتك، يتسارع تنفسك. هذا هو نظام الإنذار في جسمك، ويُعرف أحيانًا باستجابة الكرّ أو الفرّ.",
          "قد تبدو هذه الأحاسيس الجسدية مخيفة، خاصة عندما لا يوجد خطر واضح أمامك. لكن تسارع ضربات القلب أثناء القلق ليس علامة على خلل في جسدك، بل علامة على أن نظام الإنذار يقوم بالضبط بما تطوّر ليقوم به.",
        ],
      },
    },
    whyThisWorks: {
      en: "Naming the physical sensations of anxiety as 'my alarm system firing' rather than 'something dangerous happening to me' reduces the fear of the fear itself.",
      fr: "Nommer les sensations physiques de l'anxiété comme « mon système d'alarme qui se déclenche », plutôt que comme « quelque chose de dangereux qui m'arrive », réduit la peur de la peur elle-même.",
      ar: "تسمية الأحاسيس الجسدية للقلق بأنها «نظام إنذاري ينطلق» بدلاً من «شيء خطير يحدث لي» يقلل من الخوف من الخوف نفسه.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "This feeling will pass. My body knows how to return to calm.",
      fr: "Cette sensation va passer. Mon corps sait revenir au calme.",
      ar: "هذا الشعور سيزول. جسدي يعرف كيف يعود إلى الهدوء.",
    },
    reflection: {
      question: {
        en: "Which physical sensations do you notice most when anxiety shows up — a racing heart, tight chest, shallow breathing, something else?",
        fr: "Quelles sensations physiques remarquez-vous le plus quand l'anxiété apparaît — cœur qui s'accélère, poitrine serrée, respiration courte, autre chose ?",
        ar: "ما هي الأحاسيس الجسدية التي تلاحظها أكثر عند ظهور القلق — تسارع القلب، ضيق الصدر، تنفس ضحل، أم شيء آخر؟",
      },
    },
    category: "education",
    tags: ["foundation", "psychoeducation"],
    targets: ["high_anxiety", "first_program"],
    difficulty: 1,
    prerequisites: ["w1s1"],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },
  {
    id: "w1s3",
    title: {
      en: "Noticing without fighting",
      fr: "Observer sans lutter",
      ar: "الملاحظة دون مقاومة",
    },
    durationMin: 6,
    typeLabel: { en: "Reflection + breathing", fr: "Réflexion + respiration", ar: "تأمل + تنفس" },
    learn: {
      paragraphs: {
        en: [
          "A common instinct when anxiety arrives is to fight it — to push the feeling away, distract from it, or convince yourself to stop feeling it. Often this makes the anxiety louder, not quieter.",
          "A gentler approach is to notice the feeling without immediately trying to change it: 'I notice anxiety is here.' This small shift — from fighting to noticing — is often where calm actually begins.",
        ],
        fr: [
          "Un réflexe courant face à l'anxiété est de lutter contre elle — repousser la sensation, se distraire, ou se convaincre d'arrêter de la ressentir. Cela rend souvent l'anxiété plus forte, pas plus discrète.",
          "Une approche plus douce consiste à observer la sensation sans chercher immédiatement à la changer : « je remarque que l'anxiété est là ». Ce petit changement — de la lutte à l'observation — est souvent là où le calme commence vraiment.",
        ],
        ar: [
          "الاستجابة الشائعة عند ظهور القلق هي محاربته — دفع الشعور بعيدًا، أو تشتيت الانتباه عنه، أو إقناع نفسك بالتوقف عن الشعور به. غالبًا ما يجعل هذا القلق أعلى صوتًا لا أهدأ.",
          "النهج الألطف هو ملاحظة الشعور دون محاولة تغييره فورًا: «ألاحظ أن القلق موجود الآن». هذا التحول البسيط — من المحاربة إلى الملاحظة — غالبًا ما يكون حيث يبدأ الهدوء فعليًا.",
        ],
      },
    },
    whyThisWorks: {
      en: "Struggling against a feeling keeps your nervous system activated; observing it with curiosity, rather than resistance, allows the alarm response to settle on its own.",
      fr: "Lutter contre une émotion maintient votre système nerveux activé ; l'observer avec curiosité plutôt qu'avec résistance permet à la réaction d'alarme de s'apaiser d'elle-même.",
      ar: "مقاومة شعور ما تبقي جهازك العصبي في حالة تنشيط؛ أما ملاحظته بفضول بدلاً من المقاومة فتسمح لاستجابة الإنذار بالهدوء من تلقاء نفسها.",
    },
    breathing: { pattern: "box", durationSec: 120, defaultSound: "rain" },
    affirmation: {
      en: "I can notice this feeling without needing to fix it right away.",
      fr: "Je peux observer cette sensation sans avoir besoin de la résoudre tout de suite.",
      ar: "يمكنني ملاحظة هذا الشعور دون الحاجة لإصلاحه فورًا.",
    },
    reflection: {
      question: {
        en: "What tends to happen when you try to fight or suppress your anxiety instead of noticing it?",
        fr: "Que se passe-t-il généralement lorsque vous essayez de lutter contre votre anxiété plutôt que de l'observer ?",
        ar: "ماذا يحدث عادة عندما تحاول محاربة أو كبت قلقك بدلاً من ملاحظته؟",
      },
    },
    category: "education",
    tags: ["acceptance", "foundation"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: ["w1s2"],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },
  {
    id: "w1s4",
    title: {
      en: "Mapping your triggers",
      fr: "Identifier vos déclencheurs",
      ar: "رسم خريطة محفزاتك",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Anxiety rarely appears at random. Most people can trace it back to a handful of recurring situations, thoughts, or environments — even if it doesn't always feel that way in the moment.",
          "Mapping your own triggers isn't about avoiding them forever. It's about building awareness, so that when anxiety rises, you can recognize the pattern instead of being caught off guard by it.",
        ],
        fr: [
          "L'anxiété apparaît rarement au hasard. La plupart des gens peuvent la relier à quelques situations, pensées ou environnements récurrents — même si cela ne semble pas toujours évident sur le moment.",
          "Identifier vos déclencheurs ne vise pas à les éviter pour toujours. Il s'agit de développer une conscience, afin que lorsque l'anxiété monte, vous puissiez reconnaître le schéma au lieu d'être pris·e au dépourvu.",
        ],
        ar: [
          "نادرًا ما يظهر القلق عشوائيًا. يستطيع معظم الناس ربطه بعدد قليل من المواقف أو الأفكار أو البيئات المتكررة — حتى لو لم يبدُ الأمر كذلك دائمًا في اللحظة نفسها.",
          "رسم خريطة محفزاتك لا يعني تجنبها إلى الأبد. بل يتعلق ببناء وعي، بحيث عندما يرتفع القلق، يمكنك التعرف على النمط بدلاً من أن تُفاجأ به.",
        ],
      },
    },
    triggerChips: {
      prompt: {
        en: "Which of these feel familiar to you?",
        fr: "Lesquels de ces éléments vous semblent familiers ?",
        ar: "أيّ من هذه يبدو مألوفًا لك؟",
      },
      options: {
        en: ["Crowds", "Work stress", "Sleep problems", "Social situations", "Health worries", "Family", "Money", "Being alone"],
        fr: ["Foules", "Stress au travail", "Problèmes de sommeil", "Situations sociales", "Inquiétudes de santé", "Famille", "Argent", "Solitude"],
        ar: ["الحشود", "ضغط العمل", "مشاكل النوم", "المواقف الاجتماعية", "القلق الصحي", "العائلة", "المال", "الوحدة"],
      },
    },
    whyThisWorks: {
      en: "Naming your triggers reduces the sense that anxiety is random and uncontrollable, which on its own tends to lower how severe it feels.",
      fr: "Nommer vos déclencheurs réduit l'impression que l'anxiété est aléatoire et incontrôlable, ce qui, à lui seul, tend à en diminuer l'intensité ressentie.",
      ar: "تسمية محفزاتك تقلل من الشعور بأن القلق عشوائي وغير قابل للسيطرة، وهذا وحده يميل إلى تخفيف شدته.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "Knowing my patterns gives me back a sense of control.",
      fr: "Connaître mes schémas me redonne un sentiment de contrôle.",
      ar: "معرفة أنماطي تعيد لي شعورًا بالسيطرة.",
    },
    reflection: {
      question: {
        en: "Looking at the triggers you selected, is there one that has been showing up more often lately?",
        fr: "En regardant les déclencheurs que vous avez sélectionnés, y en a-t-il un qui revient plus souvent ces derniers temps ?",
        ar: "بالنظر إلى المحفزات التي اخترتها، هل هناك واحد كان يظهر أكثر مؤخرًا؟",
      },
    },
    category: "reflection",
    tags: ["triggers", "awareness"],
    targets: ["first_program"],
    difficulty: 1,
    prerequisites: ["w1s2"],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },

  // ── Week 2 content, migrated: breathing + grounding ────────────────────
  {
    id: "w2s1",
    title: {
      en: "The 4-7-8 technique",
      fr: "La technique du 4-7-8",
      ar: "تقنية 4-7-8",
    },
    durationMin: 6,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "The 4-7-8 technique is a slow breathing pattern: inhale for 4 seconds, hold for 7, exhale for 8. The long exhale is what matters most — it signals to your nervous system that it's safe to relax.",
          "It can feel unnatural the first few times, especially the long hold. Stay gentle with yourself — the goal isn't perfect technique, it's a slower, calmer rhythm than the one anxiety was setting for you.",
        ],
        fr: [
          "La technique du 4-7-8 est un schéma de respiration lente : inspirez pendant 4 secondes, retenez pendant 7, expirez pendant 8. C'est la longue expiration qui compte le plus — elle indique à votre système nerveux qu'il est prêt à se détendre.",
          "Cela peut sembler inhabituel les premières fois, surtout la longue rétention. Restez indulgent·e envers vous-même — l'objectif n'est pas une technique parfaite, mais un rythme plus lent et plus calme que celui imposé par l'anxiété.",
        ],
        ar: [
          "تقنية 4-7-8 هي نمط تنفس بطيء: شهيق لمدة 4 ثوانٍ، حبس لمدة 7 ثوانٍ، زفير لمدة 8 ثوانٍ. الزفير الطويل هو الأهم — فهو يرسل إشارة لجهازك العصبي بأنه آمن الآن للاسترخاء.",
          "قد يبدو الأمر غير مألوف في المرات الأولى، خاصة الحبس الطويل. كن لطيفًا مع نفسك — الهدف ليس تقنية مثالية، بل إيقاع أبطأ وأهدأ من ذلك الذي كان يفرضه القلق.",
        ],
      },
    },
    whyThisWorks: {
      en: "Extending your exhale beyond your inhale activates the vagus nerve, which directly slows your heart rate and shifts your body out of fight-or-flight.",
      fr: "Prolonger votre expiration au-delà de votre inspiration active le nerf vague, ce qui ralentit directement votre rythme cardiaque et fait sortir votre corps du mode lutte-ou-fuite.",
      ar: "إطالة الزفير أكثر من الشهيق ينشّط العصب الحائر، الذي يبطئ مباشرة معدل ضربات قلبك ويخرج جسدك من وضع الكرّ أو الفرّ.",
    },
    breathing: { pattern: "478", durationSec: 150, defaultSound: "ocean" },
    affirmation: {
      en: "With every long exhale, I let a little more go.",
      fr: "À chaque longue expiration, je relâche un peu plus.",
      ar: "مع كل زفير طويل، أترك القليل يذهب.",
    },
    reflection: {
      question: {
        en: "How did your body feel by the end of the breathing exercise, compared to the start?",
        fr: "Comment votre corps se sentait-il à la fin de l'exercice de respiration, comparé au début ?",
        ar: "كيف شعر جسدك في نهاية تمرين التنفس، مقارنة بالبداية؟",
      },
    },
    category: "breathing",
    tags: ["technique", "478"],
    targets: [],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "breathing", pattern: "478", durationSec: 150, defaultSound: "ocean" },
  },
  {
    id: "w2s2",
    title: {
      en: "Box breathing mastery",
      fr: "Maîtriser la respiration carrée",
      ar: "إتقان التنفس المربّع",
    },
    durationMin: 6,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "Box breathing uses four equal phases — inhale, hold, exhale, hold — each for the same count, like tracing the four sides of a square. It's used by everyone from athletes to Navy SEALs to steady their focus under pressure.",
          "The evenness is the point: no phase demands more from you than another, which makes this pattern easy to return to anywhere — before a hard conversation, in a waiting room, in bed at night.",
        ],
        fr: [
          "La respiration carrée utilise quatre phases égales — inspirer, retenir, expirer, retenir — chacune sur le même compte, comme si vous traciez les quatre côtés d'un carré. Elle est utilisée aussi bien par des athlètes que par des unités d'élite pour stabiliser leur concentration sous pression.",
          "Cette régularité est justement l'intérêt : aucune phase n'exige plus qu'une autre, ce qui rend ce schéma facile à retrouver n'importe où — avant une conversation difficile, dans une salle d'attente, au lit le soir.",
        ],
        ar: [
          "يستخدم التنفس المربّع أربع مراحل متساوية — شهيق، حبس، زفير، حبس — كل منها بنفس العدّ، كأنك ترسم أضلاع مربّع. يستخدمه الرياضيون والقوات الخاصة على حد سواء لتثبيت تركيزهم تحت الضغط.",
          "التساوي هو بيت القصيد: لا تتطلب أي مرحلة أكثر من الأخرى، ما يجعل هذا النمط سهل العودة إليه في أي مكان — قبل محادثة صعبة، في غرفة الانتظار، أو في السرير ليلاً.",
        ],
      },
    },
    whyThisWorks: {
      en: "Equal-count breathing gives your mind a simple, predictable rhythm to follow, which occupies the part of your brain that anxious thoughts usually take over.",
      fr: "Une respiration à compte égal donne à votre esprit un rythme simple et prévisible à suivre, ce qui occupe la partie du cerveau habituellement envahie par les pensées anxieuses.",
      ar: "التنفس بعدّ متساوٍ يمنح عقلك إيقاعًا بسيطًا ومتوقعًا ليتبعه، وهذا يشغل الجزء من الدماغ الذي عادة ما تسيطر عليه الأفكار القلقة.",
    },
    breathing: { pattern: "box", durationSec: 150, defaultSound: "forest" },
    affirmation: {
      en: "Steady breath, steady mind.",
      fr: "Souffle stable, esprit stable.",
      ar: "نفَس ثابت، عقل ثابت.",
    },
    reflection: {
      question: {
        en: "Where in your day could this pattern be most useful to you — before, during, or after a stressful moment?",
        fr: "À quel moment de votre journée ce schéma pourrait-il vous être le plus utile — avant, pendant ou après un moment stressant ?",
        ar: "أين في يومك يمكن أن يكون هذا النمط أكثر فائدة لك — قبل لحظة التوتر، أثناءها، أم بعدها؟",
      },
    },
    category: "breathing",
    tags: ["technique", "box"],
    targets: [],
    difficulty: 1,
    prerequisites: ["w2s1"],
    suggestedWeek: 2,
    exercise: { kind: "breathing", pattern: "box", durationSec: 150, defaultSound: "forest" },
  },
  {
    id: "w2s3",
    title: {
      en: "5-4-3-2-1 grounding",
      fr: "Ancrage en 5-4-3-2-1",
      ar: "التأريض بطريقة 5-4-3-2-1",
    },
    durationMin: 6,
    typeLabel: { en: "Grounding exercise", fr: "Exercice d'ancrage", ar: "تمرين تأريض" },
    learn: {
      paragraphs: {
        en: [
          "This exercise uses your five senses to bring your attention back to the present moment: notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
          "Anxiety often pulls your attention into the future — into 'what if'. Grounding through your senses gently pulls it back to right here, right now, where you are actually safe.",
        ],
        fr: [
          "Cet exercice utilise vos cinq sens pour ramener votre attention au moment présent : remarquez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, et 1 que vous goûtez.",
          "L'anxiété entraîne souvent votre attention vers l'avenir — vers le « et si ». L'ancrage par les sens la ramène doucement ici et maintenant, là où vous êtes réellement en sécurité.",
        ],
        ar: [
          "يستخدم هذا التمرين حواسك الخمس لإعادة انتباهك إلى اللحظة الحالية: لاحظ 5 أشياء تراها، 4 تلمسها، 3 تسمعها، 2 تشمّهما، و1 تتذوقه.",
          "غالبًا ما يسحب القلق انتباهك نحو المستقبل — نحو «ماذا لو». التأريض عبر الحواس يعيده بلطف إلى هنا والآن، حيث أنت آمن بالفعل.",
        ],
      },
    },
    whyThisWorks: {
      en: "Anxious thoughts thrive on abstraction. Directing attention to concrete sensory details interrupts that spiral and re-engages the calmer, present-focused part of your brain.",
      fr: "Les pensées anxieuses se nourrissent d'abstraction. Diriger l'attention vers des détails sensoriels concrets interrompt cette spirale et réactive la partie plus calme et ancrée dans le présent de votre cerveau.",
      ar: "تزدهر الأفكار القلقة على التجريد. توجيه الانتباه نحو تفاصيل حسية ملموسة يقاطع تلك الدوامة ويعيد تنشيط الجزء الأكثر هدوءًا والمرتكز على الحاضر من دماغك.",
    },
    breathing: { pattern: "coherent", durationSec: 120, defaultSound: "forest" },
    affirmation: {
      en: "Right here, right now, I am safe.",
      fr: "Ici et maintenant, je suis en sécurité.",
      ar: "هنا والآن، أنا آمن.",
    },
    reflection: {
      question: {
        en: "Which sense — sight, touch, hearing, smell, or taste — pulled you into the present moment most easily?",
        fr: "Quel sens — la vue, le toucher, l'ouïe, l'odorat ou le goût — vous a le plus facilement ramené·e au moment présent ?",
        ar: "أي حاسة — البصر، اللمس، السمع، الشم، أم التذوق — أعادتك إلى اللحظة الحالية بأسهل طريقة؟",
      },
    },
    category: "grounding",
    tags: ["senses", "grounding"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "grounding_54321" },
  },
  {
    id: "w2s4",
    title: {
      en: "Coherent breathing",
      fr: "La respiration cohérente",
      ar: "التنفس المتناغم",
    },
    durationMin: 6,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "Coherent breathing is simple: inhale for 5 seconds, exhale for 5 seconds, no holding. At around 6 breaths a minute, this pace is close to the natural rhythm your heart and lungs settle into when you're truly at rest.",
          "Because there's no holding or counting to remember, this is often the easiest pattern to fall back on in the middle of a busy day, or to use for a longer stretch when you have the time.",
        ],
        fr: [
          "La respiration cohérente est simple : inspirez pendant 5 secondes, expirez pendant 5 secondes, sans rétention. À environ 6 respirations par minute, ce rythme se rapproche de celui que votre cœur et vos poumons adoptent naturellement au repos.",
          "Comme il n'y a ni rétention ni compte à retenir, ce schéma est souvent le plus facile à utiliser au milieu d'une journée chargée, ou à prolonger lorsque vous avez le temps.",
        ],
        ar: [
          "التنفس المتناغم بسيط: شهيق لمدة 5 ثوانٍ، زفير لمدة 5 ثوانٍ، دون حبس. بمعدل حوالي 6 أنفاس في الدقيقة، يقترب هذا الإيقاع من الإيقاع الطبيعي الذي يستقر عليه قلبك ورئتاك عند الراحة الحقيقية.",
          "لأنه لا يوجد حبس أو عدّ لتتذكره، غالبًا ما يكون هذا النمط الأسهل للعودة إليه في منتصف يوم مزدحم، أو لاستخدامه لفترة أطول عندما يتوفر لديك الوقت.",
        ],
      },
    },
    whyThisWorks: {
      en: "Breathing at roughly 6 breaths per minute maximizes heart rate variability, a measurable marker of a calm, well-regulated nervous system.",
      fr: "Respirer à environ 6 respirations par minute maximise la variabilité de la fréquence cardiaque, un marqueur mesurable d'un système nerveux calme et bien régulé.",
      ar: "التنفس بمعدل حوالي 6 أنفاس في الدقيقة يعظّم تقلب معدل ضربات القلب، وهو مؤشر قابل للقياس على جهاز عصبي هادئ ومنظّم جيدًا.",
    },
    breathing: { pattern: "coherent", durationSec: 180, defaultSound: "ocean" },
    affirmation: {
      en: "In. Out. Nothing to force, nothing to hold.",
      fr: "J'inspire. J'expire. Rien à forcer, rien à retenir.",
      ar: "شهيق. زفير. لا شيء لإجباره، لا شيء لحبسه.",
    },
    reflection: {
      question: {
        en: "How did a longer, steady breathing pattern like this one feel compared to the shorter techniques from earlier this week?",
        fr: "Comment ce schéma plus long et régulier vous a-t-il paru, comparé aux techniques plus courtes vues plus tôt cette semaine ?",
        ar: "كيف شعرت بنمط تنفس أطول وأكثر ثباتًا كهذا، مقارنة بالتقنيات الأقصر التي تعلمتها في وقت سابق من هذا الأسبوع؟",
      },
    },
    category: "breathing",
    tags: ["technique", "coherent"],
    targets: [],
    difficulty: 1,
    prerequisites: ["w2s1", "w2s2"],
    suggestedWeek: 2,
    exercise: { kind: "breathing", pattern: "coherent", durationSec: 180, defaultSound: "ocean" },
  },
  {
    id: "w2s5",
    title: {
      en: "Your emergency toolkit",
      fr: "Votre trousse d'urgence",
      ar: "حقيبة الطوارئ الخاصة بك",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "By now you have three breathing techniques and a grounding exercise. The goal this session is simple: decide which ones are yours, so you're not searching for a technique in the middle of a hard moment.",
          "There's no single right answer — some people reach for 4-7-8 before sleep and box breathing before a meeting. What matters is that you've tried them and know which one your body responds to best.",
        ],
        fr: [
          "Vous disposez maintenant de trois techniques de respiration et d'un exercice d'ancrage. L'objectif de cette séance est simple : décider lesquelles sont vraiment les vôtres, pour ne pas avoir à chercher une technique en plein moment difficile.",
          "Il n'y a pas de bonne réponse unique — certaines personnes utilisent le 4-7-8 avant de dormir et la respiration carrée avant une réunion. Ce qui compte, c'est de les avoir essayées et de savoir laquelle fonctionne le mieux pour vous.",
        ],
        ar: [
          "لديك الآن ثلاث تقنيات تنفس وتمرين تأريض واحد. الهدف من هذه الجلسة بسيط: قرر أيها تخصّك حقًا، حتى لا تبحث عن تقنية في خضم لحظة صعبة.",
          "لا توجد إجابة صحيحة واحدة — يلجأ بعض الناس إلى تقنية 4-7-8 قبل النوم والتنفس المربّع قبل اجتماع. المهم هو أنك جربتها وتعرف أيها يستجيب له جسدك بشكل أفضل.",
        ],
      },
    },
    whyThisWorks: {
      en: "Deciding on your go-to techniques in a calm moment, ahead of time, means you don't have to make that decision while already anxious — when decision-making is hardest.",
      fr: "Choisir à l'avance, dans un moment calme, les techniques auxquelles vous ferez appel évite d'avoir à prendre cette décision une fois déjà anxieux·se — au moment où décider est le plus difficile.",
      ar: "تحديد تقنياتك المفضلة مسبقًا، في لحظة هادئة، يعني أنك لست مضطرًا لاتخاذ هذا القرار وأنت قلق بالفعل — عندما يكون اتخاذ القرار في أصعب حالاته.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I already have what I need to steady myself.",
      fr: "J'ai déjà ce qu'il me faut pour me stabiliser.",
      ar: "لدي بالفعل ما أحتاجه لتثبيت نفسي.",
    },
    reflection: {
      question: {
        en: "Which technique from this week did you respond to best, and where will you use it first?",
        fr: "Quelle technique de cette semaine a le mieux fonctionné pour vous, et où l'utiliserez-vous en premier ?",
        ar: "أي تقنية من هذا الأسبوع استجبت لها أكثر، وأين ستستخدمها أولاً؟",
      },
    },
    category: "breathing",
    tags: ["consolidation", "toolkit"],
    targets: ["first_program"],
    difficulty: 2,
    prerequisites: ["w2s1", "w2s2", "w2s3", "w2s4"],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },

  // ── Week 3 content, migrated: cbt ──────────────────────────────────────
  {
    id: "w3s1",
    title: {
      en: "Catching automatic thoughts",
      fr: "Repérer les pensées automatiques",
      ar: "اكتشاف الأفكار التلقائية",
    },
    durationMin: 7,
    typeLabel: { en: "Learn + reflection", fr: "Apprentissage + réflexion", ar: "تعلّم + تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Automatic thoughts are the quick, often unnoticed thoughts that run in the background of your mind — 'they think I'm annoying,' 'I'm going to fail this.' They happen so fast they can feel like facts rather than thoughts.",
          "The first skill in working with these thoughts isn't changing them — it's simply catching them. Noticing 'a thought just told me that' is often the moment an automatic thought loses some of its grip.",
        ],
        fr: [
          "Les pensées automatiques sont ces pensées rapides, souvent inaperçues, qui défilent en arrière-plan de votre esprit — « ils me trouvent pénible », « je vais échouer ». Elles vont si vite qu'elles peuvent sembler être des faits plutôt que des pensées.",
          "La première compétence pour travailler avec ces pensées n'est pas de les changer — c'est simplement de les repérer. Remarquer « une pensée vient de me dire ça » suffit souvent à réduire l'emprise d'une pensée automatique.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "الأفكار التلقائية هي أفكار سريعة، غالبًا غير ملحوظة، تجري في خلفية ذهنك — «يعتقدون أنني مزعج»، «سأفشل في هذا». تحدث بسرعة كبيرة لدرجة أنها قد تبدو حقائق لا مجرد أفكار.",
          "المهارة الأولى للتعامل مع هذه الأفكار ليست تغييرها — بل ملاحظتها فقط. ملاحظة «فكرة ما أخبرتني للتو بهذا» غالبًا ما تكون اللحظة التي تفقد فيها الفكرة التلقائية بعض قبضتها.",
        ],
      },
    },
    whyThisWorks: {
      en: "You cannot change a thought pattern you haven't noticed. Catching automatic thoughts creates a small gap between the thought and your reaction to it.",
      fr: "Vous ne pouvez pas changer un schéma de pensée que vous n'avez pas remarqué. Repérer les pensées automatiques crée un petit espace entre la pensée et votre réaction.",
      ar: "لا يمكنك تغيير نمط فكري لم تلاحظه. اكتشاف الأفكار التلقائية يخلق مسافة صغيرة بين الفكرة وردة فعلك تجاهها.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "A thought is not a fact. I can notice it and choose what to do next.",
      fr: "Une pensée n'est pas un fait. Je peux la remarquer et choisir ce que je fais ensuite.",
      ar: "الفكرة ليست حقيقة. يمكنني ملاحظتها واختيار ما أفعله بعد ذلك.",
    },
    reflection: {
      question: {
        en: "What's one automatic thought that showed up for you recently? Can you recall the moment just before it appeared?",
        fr: "Quelle pensée automatique est apparue récemment ? Pouvez-vous vous rappeler le moment juste avant qu'elle survienne ?",
        ar: "ما هي فكرة تلقائية واحدة ظهرت لديك مؤخرًا؟ هل تتذكر اللحظة قبل ظهورها مباشرة؟",
      },
    },
    category: "cbt",
    tags: ["automatic_thoughts", "foundation"],
    targets: ["high_anxiety"],
    difficulty: 2,
    prerequisites: ["w1s1"],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },
  {
    id: "w3s2",
    title: {
      en: "Common thinking traps",
      fr: "Les pièges de pensée courants",
      ar: "فخاخ التفكير الشائعة",
    },
    durationMin: 7,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "Anxious minds tend to fall into a handful of predictable patterns, sometimes called thinking traps. Catastrophizing jumps straight to the worst outcome; mind reading assumes you know what others are thinking; all-or-nothing sees only success or total failure.",
          "These traps aren't a character flaw — they're mental shortcuts your brain uses under stress. Simply being able to name the trap you're in ('this is catastrophizing') takes away some of its power over you.",
        ],
        fr: [
          "Un esprit anxieux tombe souvent dans quelques schémas prévisibles, parfois appelés pièges de pensée. La catastrophisation saute directement au pire scénario ; la lecture de pensées suppose que vous savez ce que les autres pensent ; le tout-ou-rien ne voit que la réussite totale ou l'échec total.",
          "Ces pièges ne sont pas un défaut de caractère — ce sont des raccourcis mentaux que votre cerveau utilise sous stress. Le simple fait de nommer le piège dans lequel vous êtes (« c'est de la catastrophisation ») lui enlève une partie de son pouvoir sur vous.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "تميل العقول القلقة إلى الوقوع في عدد قليل من الأنماط المتوقعة، تُعرف أحيانًا بفخاخ التفكير. التهويل يقفز مباشرة إلى أسوأ نتيجة؛ قراءة الأفكار تفترض أنك تعرف ما يفكر فيه الآخرون؛ التفكير الثنائي لا يرى إلا النجاح التام أو الفشل التام.",
          "هذه الفخاخ ليست عيبًا في الشخصية — إنها اختصارات ذهنية يستخدمها دماغك تحت الضغط. مجرد القدرة على تسمية الفخ الذي وقعت فيه («هذا تهويل») ينزع جزءًا من سيطرته عليك.",
        ],
      },
    },
    triggerChips: {
      prompt: {
        en: "Which of these thinking traps do you recognise in yourself?",
        fr: "Lesquels de ces pièges de pensée reconnaissez-vous chez vous ?",
        ar: "أيّ من فخاخ التفكير هذه تتعرف عليها في نفسك؟",
      },
      options: {
        en: ["Catastrophizing", "Mind reading", "All-or-nothing", "Should statements", "Personalising", "Fortune telling"],
        fr: ["Catastrophisation", "Lecture de pensées", "Tout ou rien", "Pensées en « je devrais »", "Personnalisation", "Prédiction négative"],
        ar: ["التهويل", "قراءة الأفكار", "التفكير الثنائي", "عبارات «يجب أن»", "تحميل النفس المسؤولية", "التنبؤ بالسلبيات"],
      },
    },
    whyThisWorks: {
      en: "Labeling a distorted thought pattern by name activates the brain's more rational, reflective processing, making the thought easier to question.",
      fr: "Nommer un schéma de pensée déformé active le traitement plus rationnel et réfléchi du cerveau, ce qui rend la pensée plus facile à remettre en question.",
      ar: "تسمية نمط فكري مشوّه باسمه تنشّط المعالجة الأكثر عقلانية وتأملاً في الدماغ، ما يجعل مساءلة الفكرة أسهل.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I can recognise the trap without stepping fully into it.",
      fr: "Je peux reconnaître le piège sans m'y engager complètement.",
      ar: "يمكنني التعرف على الفخ دون الوقوع فيه بالكامل.",
    },
    reflection: {
      question: {
        en: "Think of a recent worry — which thinking trap(s) from the list were part of it?",
        fr: "Pensez à une inquiétude récente — quel(s) piège(s) de pensée de la liste en faisaient partie ?",
        ar: "فكّر في قلق حديث — أي فخ (فخاخ) تفكير من القائمة كان جزءًا منه؟",
      },
    },
    category: "cbt",
    tags: ["distortions", "thinking_traps"],
    targets: ["worsening_anxiety"],
    difficulty: 2,
    prerequisites: ["w3s1"],
    suggestedWeek: 3,
    exercise: { kind: "distortion_picker" },
  },
  {
    id: "w3s3",
    title: {
      en: "The thought record",
      fr: "Le registre de pensées",
      ar: "سجلّ الأفكار",
    },
    durationMin: 8,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "A thought record is a simple written exercise: note the situation, the automatic thought, the feeling it caused, and then a more balanced way of seeing the same situation.",
          "Writing it down — rather than just thinking it through — matters. Putting a thought on paper creates just enough distance to examine it, the way you might examine someone else's worry rather than your own.",
        ],
        fr: [
          "Un registre de pensées est un exercice écrit simple : notez la situation, la pensée automatique, l'émotion qu'elle a provoquée, puis une façon plus équilibrée de voir la même situation.",
          "L'écrire — plutôt que simplement y penser — compte. Mettre une pensée sur papier crée juste assez de distance pour l'examiner, comme vous examineriez l'inquiétude de quelqu'un d'autre plutôt que la vôtre.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "سجلّ الأفكار هو تمرين كتابي بسيط: دوّن الموقف، والفكرة التلقائية، والشعور الذي سبّبته، ثم طريقة أكثر توازنًا لرؤية الموقف نفسه.",
          "كتابتها — بدلاً من مجرد التفكير فيها — أمر مهم. وضع فكرة على الورق يخلق مسافة كافية لفحصها، تمامًا كما قد تفحص قلق شخص آخر بدلاً من قلقك أنت.",
        ],
      },
    },
    whyThisWorks: {
      en: "Writing engages a more deliberate, analytical mode of thinking than the fast, automatic mode that produced the anxious thought in the first place.",
      fr: "L'écriture mobilise un mode de pensée plus délibéré et analytique que le mode rapide et automatique qui a produit la pensée anxieuse au départ.",
      ar: "الكتابة تُشغّل نمط تفكير أكثر تأنيًا وتحليلاً من النمط السريع والتلقائي الذي أنتج الفكرة القلقة في المقام الأول.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I can look at my thoughts instead of just living inside them.",
      fr: "Je peux regarder mes pensées au lieu de simplement vivre à l'intérieur d'elles.",
      ar: "يمكنني النظر إلى أفكاري بدلاً من مجرد العيش بداخلها.",
    },
    reflection: {
      question: {
        en: "Pick one anxious thought from this week. What situation triggered it, and what's a more balanced way to see it?",
        fr: "Choisissez une pensée anxieuse de cette semaine. Quelle situation l'a déclenchée, et quelle serait une façon plus équilibrée de la voir ?",
        ar: "اختر فكرة قلقة واحدة من هذا الأسبوع. ما الموقف الذي أثارها، وما هي طريقة أكثر توازنًا لرؤيتها؟",
      },
    },
    category: "cbt",
    tags: ["thought_record", "writing"],
    targets: ["worsening_anxiety"],
    difficulty: 2,
    prerequisites: ["w3s1"],
    suggestedWeek: 3,
    exercise: { kind: "thought_record" },
  },
  {
    id: "w3s4",
    title: {
      en: "Reframing practice",
      fr: "S'entraîner à reformuler",
      ar: "التدرّب على إعادة الصياغة",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection + breathing", fr: "Réflexion + respiration", ar: "تأمل + تنفس" },
    learn: {
      paragraphs: {
        en: [
          "Reframing isn't about forcing positivity or pretending a problem isn't real. It's about finding a version of the thought that's just as truthful as the anxious one, but less extreme — 'I'm nervous about this presentation' instead of 'I'm going to embarrass myself completely.'",
          "With practice, reframing gets faster and feels less forced. The goal isn't to eliminate difficult thoughts, but to hold them a little more loosely.",
        ],
        fr: [
          "Reformuler ne consiste pas à forcer la positivité ou à nier un problème réel. Il s'agit de trouver une version de la pensée qui soit tout aussi vraie que la version anxieuse, mais moins extrême — « je suis nerveux·se pour cette présentation » plutôt que « je vais complètement m'humilier ».",
          "Avec la pratique, reformuler devient plus rapide et moins forcé. L'objectif n'est pas d'éliminer les pensées difficiles, mais de les tenir un peu plus légèrement.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "إعادة الصياغة لا تعني فرض الإيجابية أو التظاهر بأن المشكلة غير حقيقية. إنها تعني إيجاد نسخة من الفكرة صادقة بقدر النسخة القلقة، لكنها أقل تطرفًا — «أنا متوتر بشأن هذا العرض» بدلاً من «سأُحرج نفسي تمامًا».",
          "مع الممارسة، تصبح إعادة الصياغة أسرع وأقل تكلفًا. الهدف ليس التخلص من الأفكار الصعبة، بل حملها بخفة أكبر قليلاً.",
        ],
      },
    },
    whyThisWorks: {
      en: "A more balanced reframe is usually just as accurate as the anxious version of a thought, but carries far less emotional charge — which lowers the anxiety response itself.",
      fr: "Une reformulation plus équilibrée est généralement tout aussi exacte que la version anxieuse d'une pensée, mais porte beaucoup moins de charge émotionnelle — ce qui réduit la réponse anxieuse elle-même.",
      ar: "إعادة الصياغة المتوازنة عادة ما تكون دقيقة بقدر النسخة القلقة من الفكرة، لكنها تحمل شحنة عاطفية أقل بكثير — ما يقلل من استجابة القلق نفسها.",
    },
    breathing: { pattern: "478", durationSec: 120, defaultSound: "ocean" },
    affirmation: {
      en: "I can hold this thought a little more loosely.",
      fr: "Je peux tenir cette pensée un peu plus légèrement.",
      ar: "يمكنني حمل هذه الفكرة بخفة أكبر قليلاً.",
    },
    reflection: {
      question: {
        en: "Take one thought that's been weighing on you. What's a more balanced way to say the same thing?",
        fr: "Prenez une pensée qui vous pèse. Quelle serait une façon plus équilibrée de dire la même chose ?",
        ar: "خذ فكرة واحدة كانت تثقل عليك. ما هي طريقة أكثر توازنًا لقول الشيء نفسه؟",
      },
    },
    category: "cbt",
    tags: ["reframe", "thought_work"],
    targets: ["worsening_anxiety"],
    difficulty: 2,
    prerequisites: ["w3s3"],
    suggestedWeek: 3,
    exercise: { kind: "reframe" },
  },
  {
    id: "w3s5",
    title: {
      en: "Thoughts are not facts",
      fr: "Les pensées ne sont pas des faits",
      ar: "الأفكار ليست حقائق",
    },
    durationMin: 6,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "One of the most useful ideas in this program is also one of the simplest: a thought is an event in your mind, not necessarily a true statement about the world. Anxious thoughts feel urgent and certain, but feeling certain isn't the same as being correct.",
          "This week's practice: when a thought feels overwhelming, try adding one phrase in front of it — 'I'm having the thought that...'. Notice how it changes even without changing anything else about the thought itself.",
        ],
        fr: [
          "L'une des idées les plus utiles de ce programme est aussi l'une des plus simples : une pensée est un événement dans votre esprit, pas nécessairement une affirmation vraie sur le monde. Les pensées anxieuses semblent urgentes et certaines, mais se sentir certain·e n'est pas la même chose qu'avoir raison.",
          "Exercice de cette semaine : quand une pensée semble accablante, essayez d'ajouter une formule devant elle — « je suis en train d'avoir la pensée que... ». Remarquez comment cela change les choses, même sans rien changer d'autre à la pensée elle-même.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "واحدة من أكثر الأفكار فائدة في هذا البرنامج هي أيضًا واحدة من أبسطها: الفكرة حدث في ذهنك، وليست بالضرورة عبارة صحيحة عن العالم. تبدو الأفكار القلقة عاجلة ومؤكدة، لكن الشعور باليقين ليس نفس الشيء مثل أن تكون على صواب.",
          "تمرين هذا الأسبوع: عندما تبدو فكرة ما ساحقة، حاول إضافة عبارة أمامها — «أنا أفكّر بأن...». لاحظ كيف يتغير الأمر حتى دون تغيير أي شيء آخر في الفكرة نفسها.",
        ],
      },
    },
    whyThisWorks: {
      en: "Creating linguistic distance between yourself and a thought — 'I'm having the thought that' versus stating it as fact — reduces how much the thought is believed and acted on.",
      fr: "Créer une distance linguistique entre vous et une pensée — « je suis en train d'avoir la pensée que » plutôt que de l'énoncer comme un fait — réduit à quel point la pensée est crue et suivie d'action.",
      ar: "خلق مسافة لغوية بينك وبين الفكرة — «أنا أفكّر بأن» بدلاً من ذكرها كحقيقة — يقلل من مدى تصديق الفكرة والتصرف بناءً عليها.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I'm having a thought. That's all it is.",
      fr: "J'ai une pensée. C'est tout ce que c'est.",
      ar: "أنا أفكّر بفكرة. هذا كل ما في الأمر.",
    },
    reflection: {
      question: {
        en: "Try the phrase 'I'm having the thought that...' with something on your mind right now. What shifts, even slightly?",
        fr: "Essayez la formule « je suis en train d'avoir la pensée que... » avec quelque chose qui vous préoccupe en ce moment. Qu'est-ce qui change, même légèrement ?",
        ar: "جرّب عبارة «أنا أفكّر بأن...» مع شيء يشغل بالك الآن. ماذا يتغير، ولو قليلاً؟",
      },
    },
    category: "cbt",
    tags: ["defusion", "foundation"],
    targets: [],
    difficulty: 2,
    prerequisites: ["w3s1"],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },

  // ── Week 4 content, migrated: reflection + planning ────────────────────
  {
    id: "w4s1",
    title: {
      en: "Your personal toolkit",
      fr: "Votre trousse personnelle",
      ar: "حقيبتك الشخصية",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Over the past three weeks you've built a set of tools: breathing techniques, grounding exercises, and ways of catching and reframing anxious thoughts. This session is about pulling them together into something that's actually yours.",
          "A toolkit only works if you can reach for it quickly, so today is about choosing — not collecting more, but deciding which two or three tools you'll actually reach for first.",
        ],
        fr: [
          "Au cours des trois dernières semaines, vous avez construit un ensemble d'outils : des techniques de respiration, des exercices d'ancrage, et des façons de repérer et reformuler les pensées anxieuses. Cette séance consiste à les rassembler en quelque chose qui est vraiment le vôtre.",
          "Une trousse ne fonctionne que si vous pouvez y accéder rapidement : aujourd'hui, il s'agit de choisir — non pas d'accumuler plus d'outils, mais de décider lesquels deux ou trois vous utiliserez vraiment en premier.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "على مدى الأسابيع الثلاثة الماضية، بنيت مجموعة من الأدوات: تقنيات تنفس، تمارين تأريض، وطرق لاكتشاف الأفكار القلقة وإعادة صياغتها. هذه الجلسة تتعلق بجمعها في شيء يخصّك حقًا.",
          "الحقيبة لا تنجح إلا إذا استطعت الوصول إليها بسرعة، لذا يتعلق اليوم بالاختيار — ليس بجمع المزيد، بل بتحديد أداتين أو ثلاث ستستخدمها فعلاً أولاً.",
        ],
      },
    },
    triggerChips: {
      prompt: {
        en: "Which tools have worked best for you so far?",
        fr: "Quels outils ont le mieux fonctionné pour vous jusqu'à présent ?",
        ar: "ما هي الأدوات التي نجحت معك أكثر حتى الآن؟",
      },
      options: {
        en: ["Breathing techniques", "Grounding exercises", "Journaling", "Talking to someone", "Movement", "Reframing thoughts", "Rest", "Nature"],
        fr: ["Techniques de respiration", "Exercices d'ancrage", "Écriture", "Parler à quelqu'un", "Mouvement", "Reformuler ses pensées", "Repos", "Nature"],
        ar: ["تقنيات التنفس", "تمارين التأريض", "الكتابة", "التحدث مع شخص ما", "الحركة", "إعادة صياغة الأفكار", "الراحة", "الطبيعة"],
      },
    },
    whyThisWorks: {
      en: "A small, well-practiced toolkit is used more reliably under stress than a long list of options you have to think through in the moment.",
      fr: "Une petite trousse bien maîtrisée est utilisée plus fiablement sous stress qu'une longue liste d'options à passer en revue sur le moment.",
      ar: "حقيبة أدوات صغيرة ومتقنة تُستخدم بموثوقية أكبر تحت الضغط من قائمة طويلة من الخيارات يجب التفكير فيها في اللحظة نفسها.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I have real tools now, not just hope.",
      fr: "J'ai maintenant de vrais outils, pas seulement de l'espoir.",
      ar: "لدي الآن أدوات حقيقية، لا مجرد أمل.",
    },
    reflection: {
      question: {
        en: "Which two or three tools from this program will you commit to using first when anxiety rises?",
        fr: "Quels sont les deux ou trois outils de ce programme que vous vous engagez à utiliser en premier quand l'anxiété monte ?",
        ar: "ما هي الأداتان أو الثلاث من هذا البرنامج التي ستلتزم باستخدامها أولاً عند ارتفاع القلق؟",
      },
    },
    category: "reflection",
    tags: ["consolidation", "toolkit"],
    targets: [],
    difficulty: 2,
    prerequisites: ["w2s5", "w3s3"],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },
  {
    id: "w4s2",
    title: {
      en: "Handling setbacks",
      fr: "Gérer les rechutes",
      ar: "التعامل مع الانتكاسات",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "Progress with anxiety is rarely a straight line. A hard day, or even a hard week, after weeks of feeling steadier doesn't mean you've lost your progress — it means you're human, and anxiety is not something that gets 'cured' once and for all.",
          "What matters most after a setback isn't preventing every future one — it's how quickly and kindly you return to your tools when it happens.",
        ],
        fr: [
          "Les progrès face à l'anxiété suivent rarement une ligne droite. Une journée difficile, voire une semaine difficile, après des semaines de mieux-être ne signifie pas que vous avez perdu vos progrès — cela signifie que vous êtes humain·e, et que l'anxiété n'est pas quelque chose que l'on « guérit » une fois pour toutes.",
          "Ce qui compte le plus après une rechute, ce n'est pas d'empêcher toutes les suivantes — c'est la rapidité et la bienveillance avec lesquelles vous revenez à vos outils quand cela arrive.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "نادرًا ما يكون التقدم مع القلق خطًا مستقيمًا. يوم صعب، أو حتى أسبوع صعب، بعد أسابيع من الشعور بثبات أكبر لا يعني أنك فقدت تقدمك — بل يعني أنك إنسان، وأن القلق ليس شيئًا «يُشفى» منه نهائيًا.",
          "ما يهم أكثر بعد الانتكاسة ليس منع كل انتكاسة مستقبلية — بل مدى سرعة ولطف عودتك إلى أدواتك عندما تحدث.",
        ],
      },
    },
    whyThisWorks: {
      en: "Framing setbacks as expected, rather than as failure, reduces the shame response that often makes people abandon their coping tools right when they need them most.",
      fr: "Considérer les rechutes comme attendues plutôt que comme un échec réduit la réaction de honte qui pousse souvent à abandonner ses outils précisément quand on en a le plus besoin.",
      ar: "اعتبار الانتكاسات أمرًا متوقعًا، لا فشلاً، يقلل من استجابة الخجل التي غالبًا ما تدفع الناس للتخلي عن أدوات التأقلم في اللحظة التي يحتاجونها فيها أكثر.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "A hard day doesn't erase everything I've built.",
      fr: "Une journée difficile n'efface pas tout ce que j'ai construit.",
      ar: "يوم صعب لا يمحو كل ما بنيته.",
    },
    reflection: {
      question: {
        en: "Think of a recent setback. How quickly were you able to return to using a tool, and what helped you do that?",
        fr: "Pensez à une rechute récente. À quelle vitesse avez-vous pu revenir à un outil, et qu'est-ce qui vous y a aidé·e ?",
        ar: "فكّر في انتكاسة حديثة. ما مدى سرعة عودتك لاستخدام إحدى أدواتك، وما الذي ساعدك على ذلك؟",
      },
    },
    category: "planning",
    tags: ["setbacks", "resilience"],
    targets: [],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },
  {
    id: "w4s3",
    title: {
      en: "Your maintenance plan",
      fr: "Votre plan de maintien",
      ar: "خطة الحفاظ على التقدم",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Now that the structured part of this program is nearly done, it helps to have a simple plan for what comes next — which practices you'll keep doing regularly, and which signs will tell you it's time to lean on them more.",
          "A maintenance plan doesn't need to be complicated. It can be as simple as: one breathing practice most days, a thought record when something feels stuck, and a short list of your early warning signs.",
        ],
        fr: [
          "Maintenant que la partie structurée de ce programme touche à sa fin, il est utile d'avoir un plan simple pour la suite — quelles pratiques vous continuerez régulièrement, et quels signes vous indiqueront qu'il est temps de vous appuyer davantage sur elles.",
          "Un plan de maintien n'a pas besoin d'être compliqué. Il peut se résumer à : une pratique de respiration la plupart des jours, un registre de pensées quand quelque chose semble bloqué, et une courte liste de vos signes avant-coureurs.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "الآن وقد أوشك الجزء المنظّم من هذا البرنامج على الانتهاء، من المفيد أن يكون لديك خطة بسيطة لما هو قادم — أي الممارسات التي ستستمر بها بانتظام، وأي العلامات ستخبرك أن الوقت قد حان للاعتماد عليها أكثر.",
          "خطة الحفاظ على التقدم لا تحتاج أن تكون معقدة. يمكن أن تكون بسيطة مثل: ممارسة تنفس معظم الأيام، سجلّ أفكار عندما يبدو شيء عالقًا، وقائمة قصيرة بعلاماتك التحذيرية المبكرة.",
        ],
      },
    },
    whyThisWorks: {
      en: "People are far more likely to keep using a coping skill when they've decided in advance, in a calm moment, exactly when and how they'll use it.",
      fr: "Les personnes sont bien plus susceptibles de continuer à utiliser une compétence d'adaptation lorsqu'elles ont décidé à l'avance, dans un moment calme, exactement quand et comment l'utiliser.",
      ar: "الأشخاص أكثر ميلاً بكثير للاستمرار في استخدام مهارة تأقلم عندما يقررون مسبقًا، في لحظة هادئة، متى وكيف بالضبط سيستخدمونها.",
    },
    breathing: { pattern: "box", durationSec: 120, defaultSound: "ocean" },
    affirmation: {
      en: "I'm building something that will keep working after today.",
      fr: "Je construis quelque chose qui continuera à fonctionner après aujourd'hui.",
      ar: "أنا أبني شيئًا سيستمر في العمل بعد اليوم.",
    },
    reflection: {
      question: {
        en: "What are one or two early warning signs that tell you it's time to lean more on your tools?",
        fr: "Quels sont un ou deux signes avant-coureurs qui vous indiquent qu'il est temps de vous appuyer davantage sur vos outils ?",
        ar: "ما هي علامة أو علامتان تحذيريتان مبكرتان تخبرانك أن الوقت قد حان للاعتماد أكثر على أدواتك؟",
      },
    },
    category: "planning",
    tags: ["maintenance"],
    targets: [],
    difficulty: 2,
    prerequisites: ["w4s2"],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },
  {
    id: "w4s4",
    title: {
      en: "Program review and next steps",
      fr: "Bilan du programme et prochaines étapes",
      ar: "مراجعة البرنامج والخطوات القادمة",
    },
    durationMin: 8,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Over four weeks, you've learned what anxiety is and why it happens, practiced four different ways to calm your body, and built skills for noticing and reshaping anxious thoughts. That's genuine, practical progress.",
          "This is also a good moment to be honest about what's still hard, and to talk with your practitioner about what kind of support makes sense from here — whether that's continuing on your own, revisiting parts of this program, or something else.",
        ],
        fr: [
          "En quatre semaines, vous avez appris ce qu'est l'anxiété et pourquoi elle survient, pratiqué quatre façons différentes d'apaiser votre corps, et développé des compétences pour repérer et transformer les pensées anxieuses. C'est un progrès réel et concret.",
          "C'est aussi le bon moment pour être honnête sur ce qui reste difficile, et pour parler avec votre praticien·ne du type de soutien qui a du sens à partir de maintenant — que ce soit continuer seul·e, revoir certaines parties de ce programme, ou autre chose.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "على مدى أربعة أسابيع، تعلمت ما هو القلق ولماذا يحدث، ومارست أربع طرق مختلفة لتهدئة جسدك، وبنيت مهارات لملاحظة الأفكار القلقة وإعادة تشكيلها. هذا تقدم حقيقي وعملي.",
          "هذه أيضًا لحظة جيدة لتكون صادقًا بشأن ما لا يزال صعبًا، وللتحدث مع معالجك حول نوع الدعم المناسب من الآن فصاعدًا — سواء كان الاستمرار بمفردك، أو مراجعة أجزاء من هذا البرنامج، أو شيء آخر.",
        ],
      },
    },
    whyThisWorks: {
      en: "Reviewing progress explicitly — rather than only noticing what's still difficult — helps consolidate new skills into lasting habits.",
      fr: "Faire explicitement le bilan des progrès — plutôt que de ne remarquer que ce qui reste difficile — aide à consolider les nouvelles compétences en habitudes durables.",
      ar: "مراجعة التقدم بشكل صريح — بدلاً من ملاحظة ما لا يزال صعبًا فقط — يساعد على ترسيخ المهارات الجديدة كعادات دائمة.",
    },
    breathing: { pattern: "coherent", durationSec: 150, defaultSound: "forest" },
    affirmation: {
      en: "I showed up for myself, four weeks in a row.",
      fr: "Je me suis présenté·e pour moi-même, quatre semaines de suite.",
      ar: "حضرت لنفسي، أربعة أسابيع متتالية.",
    },
    reflection: {
      question: {
        en: "Looking back over the whole program, what's the one change you're most proud of?",
        fr: "En regardant l'ensemble du programme, quel est le changement dont vous êtes le plus fier ou la plus fière ?",
        ar: "بالنظر إلى البرنامج بأكمله، ما هو التغيير الذي تفتخر به أكثر؟",
      },
    },
    category: "reflection",
    tags: ["review", "consolidation"],
    targets: [],
    difficulty: 2,
    prerequisites: ["w4s1", "w4s3"],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },

  // ── New sessions (22) — education ──────────────────────────────────────
  {
    id: "anx-avoidance-cycle",
    title: {
      en: "The avoidance cycle",
      fr: "Le cycle de l'évitement",
      ar: "دورة التجنب",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "Avoiding what makes you anxious brings quick relief — but that relief is exactly what teaches your brain the situation was dangerous, making the anxiety around it grow rather than shrink.",
          "Breaking the cycle doesn't mean forcing yourself into everything at once. It means noticing where you're avoiding, and taking small, deliberate steps back toward it.",
        ],
        fr: [
          "Éviter ce qui vous rend anxieux·se apporte un soulagement immédiat — mais ce soulagement est justement ce qui apprend à votre cerveau que la situation était dangereuse, ce qui fait grandir l'anxiété au lieu de la réduire.",
          "Briser ce cycle ne signifie pas se forcer à tout affronter d'un coup. Cela signifie repérer où vous évitez, puis faire de petits pas délibérés pour vous en rapprocher à nouveau.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "تجنب ما يثير قلقك يمنحك راحة سريعة — لكن هذه الراحة هي بالضبط ما يعلّم دماغك أن الموقف كان خطيرًا، ما يجعل القلق المرتبط به يكبر بدلاً من أن يتقلص.",
          "كسر هذه الدورة لا يعني إجبار نفسك على مواجهة كل شيء دفعة واحدة. بل يعني ملاحظة أين تتجنب، واتخاذ خطوات صغيرة ومتعمدة للاقتراب منه مجددًا.",
        ],
      },
    },
    whyThisWorks: {
      en: "Avoidance provides short-term relief but reinforces the brain's threat signal long-term; gradual, repeated approach is what actually teaches the brain a situation is safe.",
      fr: "L'évitement apporte un soulagement à court terme mais renforce durablement le signal de menace du cerveau ; c'est l'exposition progressive et répétée qui apprend réellement au cerveau qu'une situation est sûre.",
      ar: "التجنب يمنح راحة قصيرة المدى لكنه يعزز إشارة التهديد في الدماغ على المدى الطويل؛ التعرض التدريجي والمتكرر هو ما يعلّم الدماغ فعليًا أن الموقف آمن.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "One small step toward what I avoid is still real progress.",
      fr: "Un petit pas vers ce que j'évite reste un vrai progrès.",
      ar: "خطوة صغيرة نحو ما أتجنبه لا تزال تقدمًا حقيقيًا.",
    },
    reflection: {
      question: {
        en: "What is one small, manageable step you could take this week toward something you've been avoiding?",
        fr: "Quel petit pas gérable pourriez-vous faire cette semaine vers quelque chose que vous évitez ?",
        ar: "ما هي خطوة صغيرة يمكن إدارتها يمكنك اتخاذها هذا الأسبوع نحو شيء كنت تتجنبه؟",
      },
    },
    category: "education",
    tags: ["foundation", "avoidance"],
    targets: ["high_anxiety", "worsening_anxiety"],
    difficulty: 1,
    prerequisites: ["w1s1"],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },
  {
    id: "anx-sleep-anxiety",
    title: {
      en: "Sleep and anxiety",
      fr: "Sommeil et anxiété",
      ar: "النوم والقلق",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "Anxiety and poor sleep feed each other: a wired mind makes it hard to fall asleep, and a tired body has less capacity to handle anxious thoughts the next day.",
          "You don't need to solve sleep and anxiety separately. Small, consistent changes to how you wind down in the evening often ease both at once.",
        ],
        fr: [
          "L'anxiété et le manque de sommeil s'alimentent mutuellement : un esprit en alerte rend l'endormissement difficile, et un corps fatigué a moins de ressources pour gérer les pensées anxieuses le lendemain.",
          "Vous n'avez pas besoin de résoudre le sommeil et l'anxiété séparément. De petits changements constants dans votre façon de vous détendre le soir apaisent souvent les deux à la fois.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "يغذّي القلق وقلة النوم بعضهما البعض: العقل المتيقظ يصعّب الخلود إلى النوم، والجسد المتعب لديه قدرة أقل على التعامل مع الأفكار القلقة في اليوم التالي.",
          "لست بحاجة لحل مشكلتي النوم والقلق بشكل منفصل. التغييرات الصغيرة والمستمرة في طريقة استرخائك مساءً غالبًا ما تخفف كليهما معًا.",
        ],
      },
    },
    whyThisWorks: {
      en: "Sleep deprivation heightens activity in the brain's threat-detection regions, so improving sleep quality directly lowers next-day anxiety reactivity.",
      fr: "Le manque de sommeil accroît l'activité des régions cérébrales de détection des menaces ; améliorer la qualité du sommeil réduit donc directement la réactivité anxieuse du lendemain.",
      ar: "الحرمان من النوم يزيد من نشاط مناطق كشف التهديد في الدماغ، لذا فإن تحسين جودة النوم يقلل مباشرة من تفاعل القلق في اليوم التالي.",
    },
    breathing: { pattern: "478", durationSec: 150, defaultSound: "rain" },
    affirmation: {
      en: "Rest is not optional — it's part of how I care for my mind.",
      fr: "Le repos n'est pas facultatif — il fait partie de la façon dont je prends soin de mon esprit.",
      ar: "الراحة ليست خيارًا — إنها جزء من كيفية اعتنائي بعقلي.",
    },
    reflection: {
      question: {
        en: "What's one thing in your evening routine that tends to keep your mind wired at bedtime?",
        fr: "Quel élément de votre routine du soir a tendance à garder votre esprit en alerte au coucher ?",
        ar: "ما هو شيء واحد في روتينك المسائي يميل لإبقاء عقلك متيقظًا وقت النوم؟",
      },
    },
    category: "education",
    tags: ["sleep", "psychoeducation"],
    targets: ["low_sleep", "sleep_concern", "poor_sleep_quality"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 1,
    exercise: { kind: "none" },
  },
  {
    id: "anx-medication-mood",
    title: {
      en: "Medication and mood",
      fr: "Médicaments et humeur",
      ar: "الدواء والمزاج",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "If you're taking medication as part of your care, it's normal for mood and side effects to shift while your body adjusts — and normal to have questions or doubts along the way.",
          "Missing occasional doses happens, but consistency matters: many medications work by building up steadily, and skipped doses can make anxiety feel less predictable, not more manageable.",
        ],
        fr: [
          "Si vous prenez un traitement dans le cadre de vos soins, il est normal que l'humeur et les effets secondaires évoluent pendant que votre corps s'adapte — et normal d'avoir des questions ou des doutes en chemin.",
          "Il arrive d'oublier une dose occasionnellement, mais la régularité compte : de nombreux médicaments agissent en s'accumulant progressivement, et des prises manquées peuvent rendre l'anxiété moins prévisible, pas plus gérable.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "إذا كنت تتناول دواءً كجزء من رعايتك، فمن الطبيعي أن يتغير مزاجك وتظهر آثار جانبية بينما يتكيف جسدك — ومن الطبيعي أن تراودك أسئلة أو شكوك في الطريق.",
          "قد تفوتك جرعة أحيانًا، لكن الانتظام مهم: تعمل أدوية كثيرة عبر التراكم التدريجي، وتفويت الجرعات قد يجعل القلق أقل قابلية للتنبؤ، لا أسهل للتحكم فيه.",
        ],
      },
    },
    whyThisWorks: {
      en: "Consistent medication timing keeps blood levels steady, which is what allows many anxiety medications to build their intended effect over time.",
      fr: "Une prise régulière du traitement maintient des taux sanguins stables, ce qui permet à de nombreux médicaments contre l'anxiété de développer leur effet prévu avec le temps.",
      ar: "الالتزام بمواعيد الدواء يحافظ على مستويات ثابتة في الدم، وهو ما يسمح لكثير من أدوية القلق ببناء تأثيرها المقصود مع الوقت.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "Questions about my treatment are worth bringing to my practitioner, not carrying alone.",
      fr: "Les questions sur mon traitement méritent d'être posées à mon praticien, pas portées seul·e.",
      ar: "الأسئلة حول علاجي تستحق أن أطرحها على معالجي، لا أن أحملها وحدي.",
    },
    reflection: {
      question: {
        en: "Is there a question or concern about your medication you haven't yet brought up with your practitioner?",
        fr: "Y a-t-il une question ou une inquiétude au sujet de votre traitement que vous n'avez pas encore abordée avec votre praticien ?",
        ar: "هل هناك سؤال أو قلق بشأن دوائك لم تطرحه بعد على معالجك؟",
      },
    },
    category: "education",
    tags: ["medication", "psychoeducation"],
    targets: ["poor_adherence", "has_side_effects"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },

  // ── New sessions — breathing ────────────────────────────────────────────
  {
    id: "anx-breath-sleep",
    title: {
      en: "Breathing for sleep",
      fr: "Respiration pour le sommeil",
      ar: "التنفس من أجل النوم",
    },
    durationMin: 6,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "This is the 4-7-8 pattern used specifically as a wind-down practice: done lying down, in a dim room, in the few minutes before you intend to sleep.",
          "Don't worry about doing it perfectly or falling asleep immediately. The point is to give your body a clear, repeated signal that it's safe to power down.",
        ],
        fr: [
          "Il s'agit du schéma 4-7-8 utilisé spécifiquement comme pratique de détente : allongé·e, dans une pièce peu éclairée, dans les minutes précédant le coucher.",
          "Ne vous inquiétez pas de le faire parfaitement ou de vous endormir immédiatement. L'objectif est de donner à votre corps un signal clair et répété qu'il est prêt à s'arrêter.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "هذا هو نمط 4-7-8 المستخدم تحديدًا كممارسة استرخاء: يُؤدى وأنت مستلقٍ، في غرفة خافتة الإضاءة، في الدقائق القليلة قبل نيتك النوم.",
          "لا تقلق بشأن أدائه بشكل مثالي أو النوم فورًا. الهدف هو إعطاء جسدك إشارة واضحة ومتكررة بأنه آمن للتوقف.",
        ],
      },
    },
    whyThisWorks: {
      en: "A slow, extended-exhale pattern practiced at bedtime lowers heart rate and shifts the body toward the parasympathetic state sleep depends on.",
      fr: "Un schéma lent à expiration prolongée pratiqué au coucher abaisse le rythme cardiaque et fait basculer le corps vers l'état parasympathique dont dépend le sommeil.",
      ar: "نمط تنفس بطيء بزفير ممتد يُمارس وقت النوم يخفض معدل ضربات القلب وينقل الجسد نحو الحالة اللاودية التي يعتمد عليها النوم.",
    },
    breathing: { pattern: "478", durationSec: 180, defaultSound: "rain" },
    affirmation: {
      en: "My body knows how to rest. I just need to make space for it.",
      fr: "Mon corps sait comment se reposer. J'ai juste besoin de lui faire de la place.",
      ar: "جسدي يعرف كيف يرتاح. أحتاج فقط أن أفسح له المجال.",
    },
    reflection: {
      question: {
        en: "How did your body feel right after this practice, compared to your usual pre-sleep state?",
        fr: "Comment votre corps se sentait-il juste après cette pratique, comparé à votre état habituel avant de dormir ?",
        ar: "كيف شعر جسدك مباشرة بعد هذه الممارسة، مقارنة بحالتك المعتادة قبل النوم؟",
      },
    },
    category: "breathing",
    tags: ["sleep", "evening"],
    targets: ["low_sleep", "sleep_concern"],
    difficulty: 1,
    prerequisites: ["w2s1"],
    suggestedWeek: 2,
    exercise: { kind: "breathing", pattern: "478", durationSec: 180, defaultSound: "rain" },
  },
  {
    id: "anx-breath-morning",
    title: {
      en: "Morning breathing routine",
      fr: "Routine de respiration matinale",
      ar: "روتين التنفس الصباحي",
    },
    durationMin: 5,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "How you start the morning sets a tone for the rest of the day. A few minutes of steady breathing before you check your phone can keep anxiety from taking the first move.",
          "This is box breathing, shortened for a quick morning practice — enough to settle your nervous system without adding pressure to an already busy start.",
        ],
        fr: [
          "La façon dont vous commencez la matinée donne le ton pour le reste de la journée. Quelques minutes de respiration régulière avant de consulter votre téléphone peuvent empêcher l'anxiété de prendre les devants.",
          "Il s'agit de la respiration carrée, raccourcie pour une pratique matinale rapide — suffisante pour apaiser votre système nerveux sans ajouter de pression à un début de journée déjà chargé.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "طريقة بدء صباحك تحدد نغمة بقية يومك. بضع دقائق من التنفس المنتظم قبل فحص هاتفك يمكن أن تمنع القلق من أخذ زمام المبادرة.",
          "هذا هو التنفس المربّع، مختصرًا لممارسة صباحية سريعة — كافٍ لتهدئة جهازك العصبي دون إضافة ضغط إلى بداية يوم مزدحم أصلاً.",
        ],
      },
    },
    whyThisWorks: {
      en: "Regulating your nervous system before the day's first stressors arrive builds a calmer baseline that anxious triggers have to work harder to override.",
      fr: "Réguler votre système nerveux avant l'arrivée des premiers facteurs de stress de la journée crée une base plus calme, que les déclencheurs anxieux doivent davantage combattre.",
      ar: "تنظيم جهازك العصبي قبل وصول أول ضغوط اليوم يبني خط أساس أكثر هدوءًا، تحتاج المحفزات القلقة لجهد أكبر لتجاوزه.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I get to choose how I meet this day, starting with my breath.",
      fr: "Je choisis comment j'aborde cette journée, en commençant par mon souffle.",
      ar: "أختار كيف أستقبل هذا اليوم، بدءًا من نَفَسي.",
    },
    reflection: {
      question: {
        en: "What's one small change you could make to your morning to give yourself this minute before the day takes over?",
        fr: "Quel petit changement pourriez-vous apporter à votre matin pour vous accorder cette minute avant que la journée ne prenne le dessus ?",
        ar: "ما هو تغيير صغير يمكنك إجراؤه في صباحك لمنح نفسك هذه الدقيقة قبل أن يسيطر اليوم؟",
      },
    },
    category: "breathing",
    tags: ["morning", "routine"],
    targets: ["first_program"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 1,
    exercise: { kind: "breathing", pattern: "box", durationSec: 90, defaultSound: "forest" },
  },
  {
    id: "anx-breath-sunday-reset",
    title: {
      en: "Sunday evening reset",
      fr: "Rituel de réinitialisation du dimanche soir",
      ar: "إعادة ضبط مساء الأحد",
    },
    durationMin: 6,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "For many people, anxiety climbs specifically on Sunday evenings — the week ahead feels close, and the mind starts running through everything on the list.",
          "This practice is meant as a weekly checkpoint: a few minutes of coherent breathing paired with naming just one thing you're looking forward to, and one thing you'll handle when it comes.",
        ],
        fr: [
          "Pour beaucoup, l'anxiété grimpe spécifiquement le dimanche soir — la semaine à venir semble proche, et l'esprit commence à repasser toute la liste des tâches.",
          "Cette pratique se veut un rendez-vous hebdomadaire : quelques minutes de respiration cohérente associées au fait de nommer une chose que vous attendez avec plaisir, et une chose que vous gérerez le moment venu.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "بالنسبة للكثيرين، يرتفع القلق تحديدًا مساء الأحد — إذ يبدو الأسبوع القادم قريبًا، ويبدأ العقل بمراجعة كل ما في القائمة.",
          "هذه الممارسة مقصودة كنقطة تفقد أسبوعية: بضع دقائق من التنفس المتناغم مقترنة بتسمية شيء واحد تتطلع إليه، وشيء واحد ستتعامل معه عند حدوثه.",
        ],
      },
    },
    whyThisWorks: {
      en: "Naming a specific worry alongside a specific positive anchor prevents anticipatory anxiety from generalizing into a vague sense of dread about the whole week.",
      fr: "Nommer une inquiétude précise aux côtés d'un point d'ancrage positif précis empêche l'anxiété anticipatoire de se généraliser en une appréhension vague de toute la semaine.",
      ar: "تسمية قلق محدد إلى جانب مرتكز إيجابي محدد يمنع القلق الاستباقي من التعمم إلى شعور غامض بالخوف من الأسبوع بأكمله.",
    },
    breathing: { pattern: "coherent", durationSec: 180, defaultSound: "ocean" },
    affirmation: {
      en: "The week hasn't started yet. Right now, I only need to handle right now.",
      fr: "La semaine n'a pas encore commencé. En ce moment, je n'ai qu'à gérer cet instant.",
      ar: "الأسبوع لم يبدأ بعد. الآن، ليس عليّ سوى التعامل مع الآن.",
    },
    reflection: {
      question: {
        en: "What's one thing about the coming week you're genuinely looking forward to, even a small one?",
        fr: "Quelle est une chose, même petite, que vous attendez sincèrement avec plaisir dans la semaine à venir ?",
        ar: "ما هو شيء واحد تتطلع إليه بصدق في الأسبوع القادم، ولو كان صغيرًا؟",
      },
    },
    category: "breathing",
    tags: ["weekly", "anticipatory"],
    targets: ["anticipatory_anxiety", "worsening_anxiety"],
    difficulty: 2,
    prerequisites: ["w2s4"],
    suggestedWeek: 2,
    exercise: { kind: "breathing", pattern: "coherent", durationSec: 180, defaultSound: "ocean" },
  },
  {
    id: "anx-breath-acute-spike",
    title: {
      en: "Acute spike reset",
      fr: "Réinitialisation en cas de pic aigu",
      ar: "إعادة ضبط نوبة القلق الحادة",
    },
    durationMin: 3,
    typeLabel: { en: "Breathing", fr: "Respiration", ar: "تنفس" },
    learn: {
      paragraphs: {
        en: [
          "Some moments call for something faster than a full practice — a sudden spike of anxiety before a meeting, a difficult text, a wave that hits out of nowhere.",
          "This is a short, focused round of 4-7-8 breathing: just enough cycles to interrupt the spike without needing to find a quiet room or block out several minutes.",
        ],
        fr: [
          "Certains moments demandent quelque chose de plus rapide qu'une pratique complète — un pic d'anxiété soudain avant une réunion, un message difficile, une vague qui survient sans prévenir.",
          "Il s'agit d'un court cycle ciblé de respiration 4-7-8 : juste assez de cycles pour interrompre le pic, sans avoir besoin de trouver une pièce calme ou de bloquer plusieurs minutes.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "بعض اللحظات تتطلب شيئًا أسرع من ممارسة كاملة — نوبة قلق مفاجئة قبل اجتماع، رسالة صعبة، موجة تضرب من العدم.",
          "هذه جولة قصيرة ومركزة من تنفس 4-7-8: عدد كافٍ من الدورات فقط لمقاطعة النوبة دون الحاجة لإيجاد غرفة هادئة أو حجز عدة دقائق.",
        ],
      },
    },
    whyThisWorks: {
      en: "Even a brief burst of extended-exhale breathing measurably slows heart rate within seconds, enough to blunt the peak of an acute anxiety spike.",
      fr: "Même une courte séquence de respiration à expiration prolongée ralentit mesurablement le rythme cardiaque en quelques secondes, suffisamment pour atténuer le pic d'une poussée d'anxiété aiguë.",
      ar: "حتى دفعة قصيرة من التنفس بزفير ممتد تبطئ معدل ضربات القلب بشكل ملموس خلال ثوانٍ، بما يكفي لتخفيف ذروة نوبة القلق الحادة.",
    },
    breathing: { pattern: "478", durationSec: 60, defaultSound: "rain" },
    affirmation: {
      en: "This spike will crest and pass. I only need to get through the next minute.",
      fr: "Ce pic va atteindre son sommet puis passer. Je n'ai qu'à traverser la minute qui vient.",
      ar: "هذه النوبة ستبلغ ذروتها ثم تمر. لا أحتاج سوى تجاوز الدقيقة القادمة.",
    },
    reflection: {
      question: {
        en: "What situation tends to trigger these sudden spikes for you most often?",
        fr: "Quelle situation a tendance à déclencher le plus souvent ces pics soudains chez vous ?",
        ar: "ما هو الموقف الذي يميل لإثارة هذه النوبات المفاجئة لديك أكثر من غيره؟",
      },
    },
    category: "breathing",
    tags: ["acute", "quick"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 1,
    exercise: { kind: "breathing", pattern: "478", durationSec: 60, defaultSound: "rain" },
  },

  // ── New sessions — grounding ────────────────────────────────────────────
  {
    id: "anx-ground-body-anchor",
    title: {
      en: "Body anchor",
      fr: "Ancrage corporel",
      ar: "الترسيخ الجسدي",
    },
    durationMin: 5,
    typeLabel: { en: "Grounding exercise", fr: "Exercice d'ancrage", ar: "تمرين تأريض" },
    learn: {
      paragraphs: {
        en: [
          "This exercise uses physical contact with the ground or a chair as an anchor: feel your feet flat on the floor, your back against the chair, your hands resting on your legs.",
          "Press gently into each point of contact for a few seconds. It's a fast way to remind your body it's supported, even when your thoughts feel like they're spinning.",
        ],
        fr: [
          "Cet exercice utilise le contact physique avec le sol ou une chaise comme point d'ancrage : sentez vos pieds à plat sur le sol, votre dos contre la chaise, vos mains posées sur vos jambes.",
          "Appuyez doucement sur chaque point de contact pendant quelques secondes. C'est un moyen rapide de rappeler à votre corps qu'il est soutenu, même quand vos pensées semblent s'emballer.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "يستخدم هذا التمرين التلامس الجسدي مع الأرض أو الكرسي كمرتكز: اشعر بقدميك مسطحتين على الأرض، وظهرك مستندًا إلى الكرسي، ويديك مستريحتين على ساقيك.",
          "اضغط برفق على كل نقطة تلامس لبضع ثوانٍ. إنها طريقة سريعة لتذكير جسدك بأنه مدعوم، حتى عندما تبدو أفكارك وكأنها تدور بلا توقف.",
        ],
      },
    },
    whyThisWorks: {
      en: "Deliberate physical pressure sends a strong, unambiguous sensory signal that competes with racing thoughts for your brain's attention.",
      fr: "Une pression physique délibérée envoie un signal sensoriel fort et sans ambiguïté qui entre en concurrence avec les pensées qui s'emballent pour capter l'attention de votre cerveau.",
      ar: "الضغط الجسدي المتعمد يرسل إشارة حسية قوية لا لبس فيها تنافس الأفكار المتسارعة على انتباه دماغك.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I am held by the ground beneath me, right now.",
      fr: "Je suis porté·e par le sol sous moi, ici et maintenant.",
      ar: "الأرض تحملني الآن، في هذه اللحظة.",
    },
    reflection: {
      question: {
        en: "Which point of contact — your feet, your back, or your hands — felt most grounding to you?",
        fr: "Quel point de contact — vos pieds, votre dos ou vos mains — vous a semblé le plus ancrant ?",
        ar: "أي نقطة تلامس — قدماك، ظهرك، أم يداك — شعرت بأنها الأكثر ترسيخًا لك؟",
      },
    },
    category: "grounding",
    tags: ["body", "quick"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },
  {
    id: "anx-ground-cold-object",
    title: {
      en: "Cold-object focus",
      fr: "Focalisation sur un objet froid",
      ar: "التركيز على جسم بارد",
    },
    durationMin: 4,
    typeLabel: { en: "Grounding exercise", fr: "Exercice d'ancrage", ar: "تمرين تأريض" },
    learn: {
      paragraphs: {
        en: [
          "Holding something cold — an ice cube, a cold water bottle, even cool tap water on your wrists — gives your nervous system an intense, immediate sensation to focus on.",
          "This isn't about distraction for its own sake. The sharpness of the cold pulls your attention out of a spiral and into your body, fast.",
        ],
        fr: [
          "Tenir quelque chose de froid — un glaçon, une bouteille d'eau fraîche, ou même de l'eau froide du robinet sur vos poignets — donne à votre système nerveux une sensation intense et immédiate sur laquelle se concentrer.",
          "Il ne s'agit pas de distraction pour elle-même. L'intensité du froid tire rapidement votre attention hors de la spirale et la ramène dans votre corps.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "حمل شيء بارد — مكعب ثلج، زجاجة ماء باردة، أو حتى ماء الصنبور البارد على معصميك — يمنح جهازك العصبي إحساسًا قويًا وفوريًا للتركيز عليه.",
          "الأمر لا يتعلق بالتشتيت لذاته. حدة البرودة تسحب انتباهك بسرعة من الدوامة وتعيده إلى جسدك.",
        ],
      },
    },
    whyThisWorks: {
      en: "A strong, sudden sensory input can interrupt an escalating anxiety spiral by redirecting attention through the body's most basic alerting pathways.",
      fr: "Un stimulus sensoriel fort et soudain peut interrompre une spirale d'anxiété croissante en redirigeant l'attention via les circuits d'alerte les plus élémentaires du corps.",
      ar: "منبه حسي قوي ومفاجئ يمكن أن يقاطع دوامة قلق متصاعدة عبر إعادة توجيه الانتباه من خلال أبسط مسارات التنبيه في الجسد.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "This sharp, clear feeling is proof I'm here, in my body, right now.",
      fr: "Cette sensation nette et vive est la preuve que je suis ici, dans mon corps, maintenant.",
      ar: "هذا الإحساس الحاد والواضح دليل على أنني هنا، في جسدي، الآن.",
    },
    reflection: {
      question: {
        en: "Where do you keep something cold within reach that you could use for this next time anxiety spikes?",
        fr: "Où gardez-vous quelque chose de froid à portée de main que vous pourriez utiliser la prochaine fois que l'anxiété monte en flèche ?",
        ar: "أين تحتفظ بشيء بارد في متناول يدك يمكنك استخدامه في المرة القادمة التي يرتفع فيها القلق؟",
      },
    },
    category: "grounding",
    tags: ["body", "quick"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },
  {
    id: "anx-ground-room-orient",
    title: {
      en: "Orienting to the room",
      fr: "S'orienter dans la pièce",
      ar: "التوجه نحو الغرفة",
    },
    durationMin: 5,
    typeLabel: { en: "Grounding exercise", fr: "Exercice d'ancrage", ar: "تمرين تأريض" },
    learn: {
      paragraphs: {
        en: [
          "When anxiety pulls you into your head, slowly turning your attention to the physical space around you — the walls, the light, the exits, the furniture — reminds your brain exactly where you are.",
          "Look around deliberately, naming a few details out loud or silently. This is especially useful in unfamiliar places, where part of the anxiety comes from not feeling oriented.",
        ],
        fr: [
          "Quand l'anxiété vous enferme dans votre tête, tourner lentement votre attention vers l'espace physique autour de vous — les murs, la lumière, les sorties, le mobilier — rappelle précisément à votre cerveau où vous êtes.",
          "Regardez autour de vous délibérément, en nommant quelques détails à voix haute ou en silence. C'est particulièrement utile dans des lieux inconnus, où une partie de l'anxiété vient du fait de ne pas se sentir orienté·e.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "عندما يسحبك القلق إلى داخل رأسك، فإن توجيه انتباهك ببطء نحو المساحة المادية من حولك — الجدران، الضوء، المخارج، الأثاث — يذكّر دماغك بدقة أين أنت.",
          "انظر حولك بتمهّل، مسمّيًا بعض التفاصيل بصوت عالٍ أو صامتًا. هذا مفيد بشكل خاص في الأماكن غير المألوفة، حيث يأتي جزء من القلق من عدم الشعور بالتوجه.",
        ],
      },
    },
    whyThisWorks: {
      en: "Actively scanning and naming your physical surroundings engages the brain's spatial-orientation systems, which naturally compete with anxious rumination.",
      fr: "Balayer et nommer activement votre environnement physique mobilise les systèmes cérébraux d'orientation spatiale, qui entrent naturellement en concurrence avec la rumination anxieuse.",
      ar: "المسح والتسمية النشطة لمحيطك المادي تُشغّل أنظمة التوجه المكاني في الدماغ، التي تنافس طبيعيًا الاجترار القلق.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I know exactly where I am. That alone makes me safer than my thoughts suggest.",
      fr: "Je sais exactement où je suis. Cela seul me rend plus en sécurité que mes pensées ne le suggèrent.",
      ar: "أعرف بالضبط أين أنا. هذا وحده يجعلني أكثر أمانًا مما توحي به أفكاري.",
    },
    reflection: {
      question: {
        en: "Think of a place where you've felt disoriented by anxiety before — what's one detail there you could anchor to next time?",
        fr: "Pensez à un endroit où vous vous êtes déjà senti·e désorienté·e par l'anxiété — quel détail pourriez-vous utiliser comme point d'ancrage la prochaine fois ?",
        ar: "فكّر في مكان شعرت فيه سابقًا بالتشتت بسبب القلق — ما هو تفصيل واحد هناك يمكنك الارتكاز عليه في المرة القادمة؟",
      },
    },
    category: "grounding",
    tags: ["body", "new_places"],
    targets: ["high_anxiety", "social_concern"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },

  // ── New sessions — cbt ──────────────────────────────────────────────────
  {
    id: "anx-cbt-evidence",
    title: {
      en: "Evidence for and against",
      fr: "Preuves pour et contre",
      ar: "الأدلة المؤيدة والمعارضة",
    },
    durationMin: 8,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "When an anxious thought feels absolutely certain, it helps to treat it like a claim in a court case: what evidence actually supports it, and what evidence points the other way?",
          "Most anxious thoughts survive this exercise looking a lot less solid — not because the worry was silly, but because certainty and evidence turn out to be different things.",
        ],
        fr: [
          "Quand une pensée anxieuse semble absolument certaine, il est utile de la traiter comme une affirmation devant un tribunal : quelles preuves la soutiennent réellement, et lesquelles vont dans l'autre sens ?",
          "La plupart des pensées anxieuses ressortent de cet exercice bien moins solides — non pas parce que l'inquiétude était absurde, mais parce que certitude et preuve se révèlent être deux choses différentes.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "عندما تبدو فكرة قلقة مؤكدة تمامًا، يساعد التعامل معها كادعاء في قضية قانونية: ما هي الأدلة التي تدعمها فعلاً، وما هي الأدلة التي تشير إلى العكس؟",
          "معظم الأفكار القلقة تخرج من هذا التمرين أقل صلابة بكثير — ليس لأن القلق كان سخيفًا، بل لأن اليقين والدليل يتبيّن أنهما شيئان مختلفان.",
        ],
      },
    },
    whyThisWorks: {
      en: "Systematically weighing evidence engages deliberate, analytical thinking that directly counters the all-or-nothing certainty anxious thoughts tend to carry.",
      fr: "Peser systématiquement les preuves mobilise une pensée délibérée et analytique qui contrecarre directement la certitude tout-ou-rien que portent souvent les pensées anxieuses.",
      ar: "وزن الأدلة بشكل منهجي يُشغّل تفكيرًا متأنيًا وتحليليًا يواجه مباشرة اليقين الثنائي الذي غالبًا ما تحمله الأفكار القلقة.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "Certainty is a feeling, not proof. I can check the evidence before I believe it.",
      fr: "La certitude est un sentiment, pas une preuve. Je peux vérifier les faits avant d'y croire.",
      ar: "اليقين شعور، لا دليل. يمكنني التحقق من الأدلة قبل أن أصدقها.",
    },
    reflection: {
      question: {
        en: "Take one anxious thought and list one piece of evidence for it and one against it. What shifted?",
        fr: "Prenez une pensée anxieuse et listez une preuve pour et une preuve contre. Qu'est-ce qui a changé ?",
        ar: "خذ فكرة قلقة واحدة واذكر دليلاً مؤيدًا وآخر معارضًا لها. ماذا تغيّر؟",
      },
    },
    category: "cbt",
    tags: ["evidence", "thought_work"],
    targets: ["high_anxiety", "worsening_anxiety"],
    difficulty: 2,
    prerequisites: ["w3s3"],
    suggestedWeek: 3,
    exercise: { kind: "thought_record" },
  },
  {
    id: "anx-cbt-worry-postponement",
    title: {
      en: "Worry postponement",
      fr: "Report du souci",
      ar: "تأجيل القلق",
    },
    durationMin: 6,
    typeLabel: { en: "Learn", fr: "Apprentissage", ar: "تعلّم" },
    learn: {
      paragraphs: {
        en: [
          "Instead of trying to stop worrying — which rarely works — this technique gives worry a scheduled home: a specific 10-15 minute window each day where you're allowed to worry freely.",
          "When a worry shows up outside that window, jot it down and tell yourself you'll think about it later. Often, by the time 'later' arrives, it doesn't feel as urgent.",
        ],
        fr: [
          "Plutôt que d'essayer d'arrêter de s'inquiéter — ce qui fonctionne rarement — cette technique donne au souci un créneau fixe : une fenêtre spécifique de 10 à 15 minutes chaque jour où vous vous autorisez à vous inquiéter librement.",
          "Quand un souci survient en dehors de ce créneau, notez-le et dites-vous que vous y penserez plus tard. Souvent, quand ce « plus tard » arrive, il ne semble plus aussi urgent.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "بدلاً من محاولة إيقاف القلق — وهو ما نادرًا ما ينجح — تمنح هذه التقنية القلق موعدًا مجدولًا: نافذة محددة من 10 إلى 15 دقيقة كل يوم يُسمح لك فيها بالقلق بحرية.",
          "عندما يظهر قلق خارج تلك النافذة، دوّنه وقل لنفسك إنك ستفكر فيه لاحقًا. غالبًا، عندما يأتي «لاحقًا»، لا يبدو الأمر عاجلاً بنفس القدر.",
        ],
      },
    },
    whyThisWorks: {
      en: "Containing worry to a set window reduces how much it intrudes on the rest of the day, and often the delay alone lowers its perceived urgency.",
      fr: "Confiner l'inquiétude à un créneau défini réduit son intrusion sur le reste de la journée, et le simple report en diminue souvent l'urgence perçue.",
      ar: "حصر القلق في نافذة محددة يقلل من تسلله إلى بقية اليوم، وغالبًا ما يقلل التأجيل وحده من إلحاحه المُدرَك.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "This worry can wait for its window. It doesn't need me right now.",
      fr: "Ce souci peut attendre son créneau. Il n'a pas besoin de moi maintenant.",
      ar: "هذا القلق يمكنه انتظار موعده. لا يحتاجني الآن.",
    },
    reflection: {
      question: {
        en: "What time of day would realistically work as your daily worry window?",
        fr: "Quel moment de la journée conviendrait réalistement comme votre créneau quotidien de souci ?",
        ar: "ما هو وقت اليوم الذي يمكن أن يكون واقعيًا كنافذة قلقك اليومية؟",
      },
    },
    category: "cbt",
    tags: ["worry", "scheduling"],
    targets: ["worsening_anxiety", "work_stress"],
    difficulty: 2,
    prerequisites: ["w3s1"],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },
  {
    id: "anx-cbt-behavioral-test",
    title: {
      en: "Behavioural test",
      fr: "Test comportemental",
      ar: "الاختبار السلوكي",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "A behavioural test turns an anxious prediction into a small experiment: 'if I speak up in this meeting, everyone will judge me' becomes something you can actually test and observe, rather than assume.",
          "Pick a low-stakes prediction, try the thing, and compare what you predicted to what actually happened. Most predictions turn out to be worse than reality.",
        ],
        fr: [
          "Un test comportemental transforme une prédiction anxieuse en une petite expérience : « si je prends la parole dans cette réunion, tout le monde va me juger » devient quelque chose que vous pouvez réellement tester et observer, plutôt que supposer.",
          "Choisissez une prédiction à faible enjeu, essayez la chose, et comparez ce que vous aviez prédit à ce qui s'est réellement passé. La plupart des prédictions se révèlent pires que la réalité.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "الاختبار السلوكي يحوّل توقعًا قلقًا إلى تجربة صغيرة: «إذا تحدثت في هذا الاجتماع، سيحكم عليّ الجميع» يصبح شيئًا يمكنك اختباره وملاحظته فعليًا، بدلاً من افتراضه.",
          "اختر توقعًا منخفض المخاطر، جرّب الأمر، وقارن بين ما توقعته وما حدث فعلاً. تتبيّن معظم التوقعات أسوأ من الواقع.",
        ],
      },
    },
    whyThisWorks: {
      en: "Directly testing a prediction against real outcomes provides disconfirming evidence that pure reflection can't — it's the most reliable way to update an anxious belief.",
      fr: "Tester directement une prédiction face à des résultats réels fournit des preuves contradictoires que la seule réflexion ne peut apporter — c'est la façon la plus fiable de modifier une croyance anxieuse.",
      ar: "اختبار التوقع مباشرة مقابل النتائج الفعلية يوفر أدلة مُفنِّدة لا يستطيع التأمل وحده تقديمها — إنها الطريقة الأكثر موثوقية لتحديث معتقد قلق.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I can test my fear instead of just believing it.",
      fr: "Je peux tester ma peur au lieu de simplement y croire.",
      ar: "يمكنني اختبار مخاوفي بدلاً من مجرد تصديقها.",
    },
    reflection: {
      question: {
        en: "What's one small prediction you could test this week, and what do you predict will happen?",
        fr: "Quelle petite prédiction pourriez-vous tester cette semaine, et que prédisez-vous qu'il se passera ?",
        ar: "ما هو توقع صغير يمكنك اختباره هذا الأسبوع، وماذا تتوقع أن يحدث؟",
      },
    },
    category: "cbt",
    tags: ["exposure", "behavioral"],
    targets: ["high_anxiety", "social_concern"],
    difficulty: 3,
    prerequisites: ["w3s4"],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },

  // ── New sessions — somatic ──────────────────────────────────────────────
  {
    id: "anx-somatic-body-scan",
    title: {
      en: "Body scan",
      fr: "Scan corporel",
      ar: "المسح الجسدي",
    },
    durationMin: 8,
    typeLabel: { en: "Somatic practice", fr: "Pratique somatique", ar: "ممارسة جسدية" },
    learn: {
      paragraphs: {
        en: [
          "A body scan means slowly moving your attention from your feet to your head, simply noticing what's there — tension, warmth, tingling, nothing at all — without trying to change it.",
          "Anxiety often lives in the body as tightness we've stopped noticing. Scanning brings that tension into awareness, which is usually the first step toward it easing on its own.",
        ],
        fr: [
          "Un scan corporel consiste à déplacer lentement votre attention des pieds à la tête, en remarquant simplement ce qui s'y trouve — tension, chaleur, picotement, ou rien du tout — sans chercher à le changer.",
          "L'anxiété se loge souvent dans le corps sous forme de tensions que nous avons cessé de remarquer. Le scan ramène cette tension à la conscience, ce qui est généralement la première étape vers son relâchement naturel.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "المسح الجسدي يعني تحريك انتباهك ببطء من قدميك إلى رأسك، ملاحظًا فقط ما هو موجود — توتر، دفء، وخز، أو لا شيء على الإطلاق — دون محاولة تغييره.",
          "غالبًا ما يعيش القلق في الجسد كتوتر توقفنا عن ملاحظته. المسح يعيد ذلك التوتر إلى الوعي، وهو عادة الخطوة الأولى نحو تخففه من تلقاء نفسه.",
        ],
      },
    },
    whyThisWorks: {
      en: "Bringing conscious attention to physical sensation, without judgment, is consistently linked to reduced muscle tension and lower subjective anxiety.",
      fr: "Porter une attention consciente aux sensations physiques, sans jugement, est régulièrement associé à une réduction de la tension musculaire et de l'anxiété ressentie.",
      ar: "توجيه انتباه واعٍ إلى الإحساس الجسدي، دون حكم، يرتبط باستمرار بانخفاض التوتر العضلي والقلق المُدرَك.",
    },
    breathing: { pattern: "coherent", durationSec: 150, defaultSound: "forest" },
    affirmation: {
      en: "I can notice tension in my body without needing to fix it immediately.",
      fr: "Je peux remarquer la tension dans mon corps sans avoir besoin de la corriger immédiatement.",
      ar: "يمكنني ملاحظة التوتر في جسدي دون الحاجة لإصلاحه فورًا.",
    },
    reflection: {
      question: {
        en: "Where in your body did you notice the most tension during this scan?",
        fr: "Où dans votre corps avez-vous remarqué le plus de tension pendant ce scan ?",
        ar: "أين في جسدك لاحظت أكبر قدر من التوتر خلال هذا المسح؟",
      },
    },
    category: "somatic",
    tags: ["body", "awareness"],
    targets: ["high_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },
  {
    id: "anx-somatic-tension-release",
    title: {
      en: "Progressive tension release",
      fr: "Relâchement musculaire progressif",
      ar: "الاسترخاء العضلي التدريجي",
    },
    durationMin: 7,
    typeLabel: { en: "Somatic practice", fr: "Pratique somatique", ar: "ممارسة جسدية" },
    learn: {
      paragraphs: {
        en: [
          "This practice works one muscle group at a time: tense it firmly for a few seconds, then let go completely, noticing the contrast between tight and relaxed.",
          "Working through the body this way — feet, legs, stomach, hands, shoulders, face — teaches your muscles what 'relaxed' actually feels like, which anxiety can make hard to remember.",
        ],
        fr: [
          "Cette pratique agit un groupe musculaire à la fois : contractez-le fermement pendant quelques secondes, puis relâchez complètement, en remarquant le contraste entre tension et détente.",
          "Parcourir le corps ainsi — pieds, jambes, ventre, mains, épaules, visage — apprend à vos muscles ce à quoi ressemble réellement la détente, ce que l'anxiété peut rendre difficile à se rappeler.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "تعمل هذه الممارسة على مجموعة عضلية واحدة في كل مرة: شدّها بإحكام لبضع ثوانٍ، ثم أرخِها تمامًا، ملاحظًا التباين بين التوتر والاسترخاء.",
          "العمل عبر الجسد بهذه الطريقة — القدمين، الساقين، البطن، اليدين، الكتفين، الوجه — يعلّم عضلاتك كيف يبدو «الاسترخاء» فعليًا، وهو ما قد يصعّب القلق تذكره.",
        ],
      },
    },
    whyThisWorks: {
      en: "Deliberately tensing then releasing a muscle produces a deeper relaxation than trying to relax directly, because the contrast is easier for the body to register.",
      fr: "Contracter délibérément un muscle puis le relâcher produit une détente plus profonde que d'essayer de se détendre directement, car le contraste est plus facile à percevoir pour le corps.",
      ar: "شدّ عضلة عمدًا ثم إرخاؤها ينتج استرخاءً أعمق من محاولة الاسترخاء مباشرة، لأن التباين أسهل على الجسد أن يسجّله.",
    },
    breathing: { pattern: "box", durationSec: 120, defaultSound: "rain" },
    affirmation: {
      en: "My body knows how to let go, one muscle at a time.",
      fr: "Mon corps sait comment relâcher, un muscle à la fois.",
      ar: "جسدي يعرف كيف يترك التوتر، عضلة تلو الأخرى.",
    },
    reflection: {
      question: {
        en: "Which muscle group held the most tension for you, and where do you usually feel that tension during a normal day?",
        fr: "Quel groupe musculaire retenait le plus de tension pour vous, et où ressentez-vous habituellement cette tension au cours d'une journée normale ?",
        ar: "أي مجموعة عضلية كانت تحمل أكبر توتر لديك، وأين تشعر عادة بذلك التوتر خلال يوم عادي؟",
      },
    },
    category: "somatic",
    tags: ["body", "muscle"],
    targets: ["high_anxiety"],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },
  {
    id: "anx-somatic-jaw-shoulders",
    title: {
      en: "Jaw and shoulders",
      fr: "Mâchoire et épaules",
      ar: "الفك والكتفان",
    },
    durationMin: 5,
    typeLabel: { en: "Somatic practice", fr: "Pratique somatique", ar: "ممارسة جسدية" },
    learn: {
      paragraphs: {
        en: [
          "The jaw and shoulders are two of the most common places anxiety quietly collects — clenched teeth, shoulders creeping up toward your ears, often without you noticing until they ache.",
          "This short practice targets just those two areas: a few rounds of gently dropping your jaw and rolling your shoulders down and back, releasing what's built up there.",
        ],
        fr: [
          "La mâchoire et les épaules sont deux des endroits où l'anxiété s'accumule le plus souvent discrètement — dents serrées, épaules qui remontent vers les oreilles, souvent sans que vous le remarquiez avant que cela ne fasse mal.",
          "Cette courte pratique cible seulement ces deux zones : quelques cycles de relâchement doux de la mâchoire et de rotation des épaules vers le bas et l'arrière, pour libérer ce qui s'y est accumulé.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "الفك والكتفان من أكثر الأماكن التي يتجمع فيها القلق بهدوء — أسنان مطبقة، كتفان يرتفعان نحو الأذنين، غالبًا دون أن تلاحظ حتى يبدآ بالألم.",
          "تستهدف هذه الممارسة القصيرة هاتين المنطقتين فقط: بضع جولات من إرخاء الفك بلطف ولفّ الكتفين للأسفل وللخلف، لتحرير ما تراكم هناك.",
        ],
      },
    },
    whyThisWorks: {
      en: "Releasing tension in the jaw and shoulders specifically interrupts a common physical feedback loop where held muscle tension keeps signaling threat back to the brain.",
      fr: "Relâcher la tension au niveau de la mâchoire et des épaules interrompt précisément une boucle de rétroaction physique courante, où la tension musculaire maintenue continue de signaler une menace au cerveau.",
      ar: "تحرير التوتر في الفك والكتفين تحديدًا يقاطع حلقة تغذية راجعة جسدية شائعة، حيث يستمر التوتر العضلي المحتجز في إرسال إشارة تهديد إلى الدماغ.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "rain" },
    affirmation: {
      en: "I can soften here, right now, without anything else needing to change.",
      fr: "Je peux me détendre ici, maintenant, sans que rien d'autre n'ait besoin de changer.",
      ar: "يمكنني أن ألين هنا، الآن، دون أن يحتاج أي شيء آخر للتغيير.",
    },
    reflection: {
      question: {
        en: "Did you notice tension in your jaw or shoulders before starting this practice that you hadn't been aware of?",
        fr: "Avez-vous remarqué une tension dans votre mâchoire ou vos épaules avant de commencer cette pratique, dont vous n'aviez pas conscience ?",
        ar: "هل لاحظت توترًا في فكك أو كتفيك قبل بدء هذه الممارسة لم تكن واعيًا به؟",
      },
    },
    category: "somatic",
    tags: ["body", "quick"],
    targets: ["high_anxiety", "work_stress"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 2,
    exercise: { kind: "none" },
  },
  {
    id: "anx-somatic-walking",
    title: {
      en: "Walking practice",
      fr: "Pratique de la marche",
      ar: "ممارسة المشي",
    },
    durationMin: 8,
    typeLabel: { en: "Somatic practice", fr: "Pratique somatique", ar: "ممارسة جسدية" },
    learn: {
      paragraphs: {
        en: [
          "Movement gives anxious energy somewhere to go. A short, unhurried walk — paying attention to your feet touching the ground, the rhythm of your steps — can settle a racing mind faster than sitting still sometimes can.",
          "This isn't about exercise or distance. It's about letting your body do something steady and repetitive while your nervous system catches up and calms down.",
        ],
        fr: [
          "Le mouvement donne à l'énergie anxieuse un endroit où aller. Une courte marche sans hâte — en portant attention à vos pieds touchant le sol, au rythme de vos pas — peut apaiser un esprit qui s'emballe plus vite que rester assis·e immobile parfois.",
          "Il ne s'agit pas d'exercice ou de distance. Il s'agit de laisser votre corps faire quelque chose de régulier et répétitif pendant que votre système nerveux rattrape son retard et se calme.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "الحركة تمنح طاقة القلق مكانًا تذهب إليه. مشية قصيرة وغير متعجلة — مع الانتباه لملامسة قدميك الأرض، وإيقاع خطواتك — يمكن أن تهدئ عقلاً متسارعًا أسرع مما قد يفعله الجلوس ساكنًا أحيانًا.",
          "الأمر لا يتعلق بالتمرين أو المسافة. بل بترك جسدك يفعل شيئًا ثابتًا ومتكررًا بينما يلحق جهازك العصبي ويهدأ.",
        ],
      },
    },
    whyThisWorks: {
      en: "Rhythmic, repetitive movement helps metabolize the stress hormones anxiety releases, which sitting still doesn't do as efficiently.",
      fr: "Un mouvement rythmique et répétitif aide à métaboliser les hormones du stress libérées par l'anxiété, ce que rester immobile ne fait pas aussi efficacement.",
      ar: "الحركة الإيقاعية المتكررة تساعد على استقلاب هرمونات التوتر التي يطلقها القلق، وهو ما لا يفعله الجلوس ساكنًا بنفس الكفاءة.",
    },
    breathing: { pattern: "coherent", durationSec: 120, defaultSound: "ocean" },
    affirmation: {
      en: "Each step is somewhere for this energy to go.",
      fr: "Chaque pas est un endroit où cette énergie peut aller.",
      ar: "كل خطوة هي مكان تذهب إليه هذه الطاقة.",
    },
    reflection: {
      question: {
        en: "Where could you fit a short walk into your day this week, even five minutes?",
        fr: "Où pourriez-vous intégrer une courte marche dans votre journée cette semaine, même cinq minutes ?",
        ar: "أين يمكنك إدراج مشية قصيرة في يومك هذا الأسبوع، ولو خمس دقائق؟",
      },
    },
    category: "somatic",
    tags: ["body", "movement"],
    targets: ["high_anxiety", "worsening_anxiety"],
    difficulty: 1,
    prerequisites: [],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },

  // ── New sessions — reflection ───────────────────────────────────────────
  {
    id: "anx-reflect-what-worked",
    title: {
      en: "What worked this week",
      fr: "Ce qui a fonctionné cette semaine",
      ar: "ما الذي نجح هذا الأسبوع",
    },
    durationMin: 6,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "It's easy to focus only on what's still hard. This session flips that: what actually helped this week, even a little — a technique, a conversation, a decision to rest?",
          "Naming what worked isn't about ignoring the hard parts. It's about building a clearer, evidence-based picture of what genuinely helps you, so you can do more of it on purpose.",
        ],
        fr: [
          "Il est facile de ne se concentrer que sur ce qui reste difficile. Cette séance inverse cela : qu'est-ce qui vous a réellement aidé cette semaine, même un peu — une technique, une conversation, une décision de vous reposer ?",
          "Nommer ce qui a fonctionné ne consiste pas à ignorer les moments difficiles. Il s'agit de vous forger une image plus claire et fondée sur les faits de ce qui vous aide réellement, pour pouvoir le refaire délibérément.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "من السهل التركيز فقط على ما لا يزال صعبًا. هذه الجلسة تعكس ذلك: ما الذي ساعدك فعليًا هذا الأسبوع، ولو قليلاً — تقنية، محادثة، قرار بالراحة؟",
          "تسمية ما نجح لا تعني تجاهل الأجزاء الصعبة. بل بناء صورة أوضح ومبنية على الأدلة لما يساعدك حقًا، حتى تتمكن من فعل المزيد منه عن قصد.",
        ],
      },
    },
    whyThisWorks: {
      en: "Explicitly reviewing what helped reinforces those specific coping behaviors, making you more likely to reach for them again under stress.",
      fr: "Passer en revue explicitement ce qui a aidé renforce ces comportements d'adaptation spécifiques, ce qui vous rend plus susceptible d'y recourir à nouveau sous stress.",
      ar: "مراجعة ما ساعد بشكل صريح يعزز سلوكيات التأقلم المحددة تلك، ما يجعلك أكثر ميلاً للجوء إليها مجددًا تحت الضغط.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I have real evidence of what helps me. That's worth remembering.",
      fr: "J'ai de vraies preuves de ce qui m'aide. Cela mérite d'être retenu.",
      ar: "لدي دليل حقيقي على ما يساعدني. هذا يستحق أن أتذكره.",
    },
    reflection: {
      question: {
        en: "What's one thing that genuinely helped you this week, even in a small way?",
        fr: "Quelle est une chose qui vous a sincèrement aidé·e cette semaine, même modestement ?",
        ar: "ما هو شيء واحد ساعدك بصدق هذا الأسبوع، ولو بشكل بسيط؟",
      },
    },
    category: "reflection",
    tags: ["weekly", "consolidation"],
    targets: [],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },
  {
    id: "anx-reflect-values",
    title: {
      en: "Values check",
      fr: "Vérification des valeurs",
      ar: "التحقق من القيم",
    },
    durationMin: 7,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Anxiety often pulls your choices toward avoiding discomfort. This session asks a different question: setting anxiety aside for a moment, what actually matters to you?",
          "Naming even one or two values — connection, honesty, growth, family — gives you something to move toward, not just something anxious to move away from.",
        ],
        fr: [
          "L'anxiété entraîne souvent vos choix vers l'évitement de l'inconfort. Cette séance pose une question différente : en mettant l'anxiété de côté un instant, qu'est-ce qui compte vraiment pour vous ?",
          "Nommer ne serait-ce qu'une ou deux valeurs — le lien aux autres, l'honnêteté, la croissance, la famille — vous donne quelque chose vers quoi avancer, pas seulement quelque chose d'anxiogène à fuir.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "غالبًا ما يدفع القلق خياراتك نحو تجنب الانزعاج. تطرح هذه الجلسة سؤالاً مختلفًا: إذا وضعنا القلق جانبًا للحظة، ما الذي يهمك فعلاً؟",
          "تسمية قيمة واحدة أو اثنتين — التواصل، الصدق، النمو، العائلة — تمنحك شيئًا تتحرك نحوه، لا مجرد شيء قلق تبتعد عنه.",
        ],
      },
    },
    whyThisWorks: {
      en: "Reconnecting decisions to personal values shifts behavior from anxiety-avoidance toward meaningful action, which tends to reduce anxiety's influence over time.",
      fr: "Reconnecter les décisions à des valeurs personnelles fait passer le comportement de l'évitement de l'anxiété vers une action porteuse de sens, ce qui tend à réduire l'influence de l'anxiété avec le temps.",
      ar: "إعادة ربط القرارات بالقيم الشخصية ينقل السلوك من تجنب القلق إلى فعل ذي معنى، ما يميل لتقليل تأثير القلق مع الوقت.",
    },
    breathing: { pattern: "box", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I can let my values guide me, even when anxiety is loud.",
      fr: "Je peux laisser mes valeurs me guider, même quand l'anxiété est bruyante.",
      ar: "يمكنني أن أدع قيمي توجهني، حتى عندما يكون القلق صاخبًا.",
    },
    reflection: {
      question: {
        en: "Name one value that matters to you. What's one small action this week that would honor it?",
        fr: "Nommez une valeur qui compte pour vous. Quelle petite action cette semaine l'honorerait ?",
        ar: "سمِّ قيمة واحدة تهمك. ما هو فعل صغير هذا الأسبوع يحترمها؟",
      },
    },
    category: "reflection",
    tags: ["values", "meaning"],
    targets: [],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 3,
    exercise: { kind: "none" },
  },
  {
    id: "anx-reflect-self-compassion",
    title: {
      en: "Self-compassion",
      fr: "Auto-compassion",
      ar: "الرحمة بالنفس",
    },
    durationMin: 6,
    typeLabel: { en: "Reflection", fr: "Réflexion", ar: "تأمل" },
    learn: {
      paragraphs: {
        en: [
          "Most people talk to themselves during anxiety far more harshly than they'd ever talk to a friend going through the same thing — 'what's wrong with you,' 'you're being ridiculous.'",
          "This session practices a different inner voice: the one you'd use for someone you care about. Not denial of the struggle, just kindness alongside it.",
        ],
        fr: [
          "La plupart des gens se parlent à eux-mêmes pendant l'anxiété bien plus durement qu'ils ne parleraient jamais à un·e ami·e vivant la même chose — « qu'est-ce qui ne va pas chez toi », « tu es ridicule ».",
          "Cette séance entraîne une autre voix intérieure : celle que vous utiliseriez pour quelqu'un que vous aimez. Non pas un déni de la difficulté, mais de la bienveillance à ses côtés.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "يخاطب معظم الناس أنفسهم أثناء القلق بقسوة أكبر بكثير مما قد يخاطبون به صديقًا يمر بنفس الأمر — «ما خطبك»، «أنت سخيف».",
          "تتدرب هذه الجلسة على صوت داخلي مختلف: ذلك الذي قد تستخدمه لشخص تهتم به. ليس إنكارًا للصعوبة، بل لطف يرافقها.",
        ],
      },
    },
    whyThisWorks: {
      en: "Self-critical inner speech keeps the body's threat response activated, while a self-compassionate tone measurably lowers physiological stress markers.",
      fr: "Un discours intérieur autocritique maintient activée la réponse de menace du corps, tandis qu'un ton d'auto-compassion abaisse mesurablement les marqueurs physiologiques du stress.",
      ar: "الحديث الداخلي الناقد للذات يبقي استجابة التهديد في الجسد نشطة، بينما يخفض النبرة المتعاطفة مع الذات بشكل قابل للقياس مؤشرات التوتر الفسيولوجية.",
    },
    breathing: { pattern: "coherent", durationSec: 120, defaultSound: "rain" },
    affirmation: {
      en: "I deserve the same kindness I'd offer someone else.",
      fr: "Je mérite la même bienveillance que j'offrirais à quelqu'un d'autre.",
      ar: "أستحق نفس اللطف الذي كنت سأقدمه لشخص آخر.",
    },
    reflection: {
      question: {
        en: "What would you say to a close friend who was struggling the way you have been? Can you say that to yourself?",
        fr: "Que diriez-vous à un·e ami·e proche qui traversait ce que vous traversez ? Pouvez-vous vous le dire à vous-même ?",
        ar: "ماذا كنت ستقول لصديق مقرب يمر بما تمر به؟ هل يمكنك أن تقول ذلك لنفسك؟",
      },
    },
    category: "reflection",
    tags: ["self-compassion", "inner_voice"],
    targets: [],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },

  // ── New sessions — planning ─────────────────────────────────────────────
  {
    id: "anx-plan-support-network",
    title: {
      en: "Building your support network",
      fr: "Construire votre réseau de soutien",
      ar: "بناء شبكة دعمك",
    },
    durationMin: 7,
    typeLabel: { en: "Planning", fr: "Planification", ar: "تخطيط" },
    learn: {
      paragraphs: {
        en: [
          "Managing anxiety long-term is easier with people around you, not despite them. This session is about mapping who's actually there for you — a friend, family member, your practitioner, a support group.",
          "You don't need a large network. Even one or two people you can be honest with about how you're doing makes a measurable difference.",
        ],
        fr: [
          "Gérer l'anxiété sur le long terme est plus facile entouré·e, et non malgré cet entourage. Cette séance consiste à identifier qui est réellement présent pour vous — un·e ami·e, un membre de la famille, votre praticien·ne, un groupe de soutien.",
          "Vous n'avez pas besoin d'un grand réseau. Même une ou deux personnes avec qui être honnête sur votre état font une différence mesurable.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "إدارة القلق على المدى الطويل أسهل مع وجود أشخاص حولك، لا رغمًا عنهم. تتعلق هذه الجلسة برسم خريطة لمن هو موجود فعلاً من أجلك — صديق، فرد من العائلة، معالجك، مجموعة دعم.",
          "لست بحاجة لشبكة كبيرة. حتى شخص أو شخصان يمكنك أن تكون صادقًا معهما حول حالتك يحدثان فرقًا ملموسًا.",
        ],
      },
    },
    whyThisWorks: {
      en: "Social support is one of the most consistently documented protective factors against anxiety worsening over time.",
      fr: "Le soutien social est l'un des facteurs protecteurs les plus régulièrement documentés contre l'aggravation de l'anxiété avec le temps.",
      ar: "الدعم الاجتماعي واحد من أكثر العوامل الوقائية توثيقًا باستمرار ضد تفاقم القلق مع الوقت.",
    },
    breathing: { pattern: "coherent", durationSec: 90, defaultSound: "forest" },
    affirmation: {
      en: "I don't have to manage this entirely on my own.",
      fr: "Je n'ai pas à gérer cela entièrement seul·e.",
      ar: "لست مضطرًا لإدارة هذا بمفردي تمامًا.",
    },
    reflection: {
      question: {
        en: "Who is one person you could be more honest with about how you're really doing?",
        fr: "Avec qui pourriez-vous être plus honnête sur la façon dont vous allez réellement ?",
        ar: "من هو شخص واحد يمكنك أن تكون أكثر صدقًا معه حول حالتك الحقيقية؟",
      },
    },
    category: "planning",
    tags: ["support", "social"],
    targets: ["social_concern"],
    difficulty: 2,
    prerequisites: [],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },
  {
    id: "anx-plan-next-90-days",
    title: {
      en: "Your next 90 days",
      fr: "Vos 90 prochains jours",
      ar: "أيامك الـ90 القادمة",
    },
    durationMin: 8,
    typeLabel: { en: "Planning", fr: "Planification", ar: "تخطيط" },
    learn: {
      paragraphs: {
        en: [
          "Finishing a structured program is a milestone, not an endpoint. This session looks ahead: what does the next three months look like if you keep building on what you've learned?",
          "Think in terms of a few concrete commitments rather than a vague intention to 'keep working on it' — a specific practice, a specific check-in date, a specific person to talk to if things get harder.",
        ],
        fr: [
          "Terminer un programme structuré est une étape, pas un aboutissement. Cette séance se tourne vers l'avenir : à quoi ressemblent les trois prochains mois si vous continuez à construire sur ce que vous avez appris ?",
          "Pensez en termes de quelques engagements concrets plutôt qu'une intention vague de « continuer à y travailler » — une pratique précise, une date de bilan précise, une personne précise à contacter si les choses se compliquent.",
        ],
        // TODO: professional Arabic translation review
        ar: [
          "إنهاء برنامج منظّم علامة فارقة، لا نهاية. تنظر هذه الجلسة إلى الأمام: كيف تبدو الأشهر الثلاثة القادمة إذا واصلت البناء على ما تعلمته؟",
          "فكّر بعدد قليل من الالتزامات الملموسة بدلاً من نية غامضة بـ«الاستمرار في العمل عليه» — ممارسة محددة، موعد متابعة محدد، شخص محدد للتحدث معه إذا ازدادت الأمور صعوبة.",
        ],
      },
    },
    whyThisWorks: {
      en: "Specific, concrete plans are far more likely to be followed through on than vague intentions, especially once daily structure and check-ins fall away.",
      fr: "Des plans précis et concrets ont beaucoup plus de chances d'être suivis que des intentions vagues, surtout une fois que la structure quotidienne et les suivis disparaissent.",
      ar: "الخطط المحددة والملموسة أكثر احتمالاً للتنفيذ من النوايا الغامضة، خصوصًا بعد زوال البنية اليومية والمتابعات.",
    },
    breathing: { pattern: "box", durationSec: 120, defaultSound: "ocean" },
    affirmation: {
      en: "What I've built here doesn't end when the program does.",
      fr: "Ce que j'ai construit ici ne s'arrête pas avec la fin du programme.",
      ar: "ما بنيته هنا لا ينتهي بانتهاء البرنامج.",
    },
    reflection: {
      question: {
        en: "What's one specific commitment you'll make for the next 90 days?",
        fr: "Quel engagement précis prendrez-vous pour les 90 prochains jours ?",
        ar: "ما هو التزام محدد واحد ستقطعه على نفسك للأيام الـ90 القادمة؟",
      },
    },
    category: "planning",
    tags: ["maintenance", "future"],
    targets: [],
    difficulty: 2,
    prerequisites: ["w4s3"],
    suggestedWeek: 4,
    exercise: { kind: "none" },
  },
]

/**
 * The original 18-session, 4-week fixed program, expressed as an ordered
 * list of ids into `SESSION_LIBRARY`. Existing `program_assignments` rows
 * (created before AI-assisted planning existed) map onto this order, and
 * it's the fallback plan whenever AI drafting is unavailable.
 */
export const DEFAULT_PROGRAM: string[] = [
  "w1s1", "w1s2", "w1s3", "w1s4",
  "w2s1", "w2s2", "w2s3", "w2s4", "w2s5",
  "w3s1", "w3s2", "w3s3", "w3s4", "w3s5",
  "w4s1", "w4s2", "w4s3", "w4s4",
]

export function findLibrarySession(sessionId: string): LibrarySession | undefined {
  return SESSION_LIBRARY.find((s) => s.id === sessionId)
}

export function librarySessionsByIds(ids: string[]): LibrarySession[] {
  const byId = new Map(SESSION_LIBRARY.map((s) => [s.id, s]))
  return ids.map((id) => byId.get(id)).filter((s): s is LibrarySession => s != null)
}

/** `DEFAULT_PROGRAM` expressed as a plan (session id + week + order-in-plan), using each
 *  session's own `suggestedWeek` — which for these 18 ids reproduces the original 4-week
 *  structure exactly. Used to seed `program_assignments.plan` for "assign default" (no AI)
 *  and as the rules-engine's starting point. */
export function defaultProgramPlan(): PlanEntry[] {
  return DEFAULT_PROGRAM.map((sessionId, index) => {
    const session = findLibrarySession(sessionId)
    return { sessionId, week: session?.suggestedWeek ?? 1, order: index }
  })
}
