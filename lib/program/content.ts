import type { Program } from "./types"

/**
 * Full content for the "Understanding and managing anxiety" structured program.
 * Arabic paragraphs for weeks 3-4 are a first-pass translation and should get
 * a professional review pass before this program is used with real patients
 * at scale — everything else (titles, prompts, affirmations, reflection
 * questions, why-this-works) has been written directly in all three languages.
 */
export const ANXIETY_PROGRAM: Program = {
  id: "anxiety-4week-v1",
  title: {
    en: "Understanding and managing anxiety",
    fr: "Comprendre et gérer l'anxiété",
    ar: "فهم القلق وإدارته",
  },
  description: {
    en: "A 4-week guided program combining breathing techniques, CBT-based reflection, and daily practice.",
    fr: "Un programme guidé de 4 semaines combinant techniques de respiration, réflexion basée sur la TCC et pratique quotidienne.",
    ar: "برنامج موجه لمدة 4 أسابيع يجمع بين تقنيات التنفس والتأمل المعرفي السلوكي والممارسة اليومية.",
  },
  totalSessions: 18,
  weeks: [
    {
      weekNumber: 1,
      color: "#2a9d8f",
      theme: {
        en: "Understanding your anxiety",
        fr: "Comprendre votre anxiété",
        ar: "فهم قلقك",
      },
      sessions: [
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
        },
      ],
    },
    {
      weekNumber: 2,
      color: "#4a8ab5",
      theme: {
        en: "Breathing and grounding",
        fr: "Respiration et ancrage",
        ar: "التنفس والتأريض",
      },
      sessions: [
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
        },
      ],
    },
    {
      weekNumber: 3,
      color: "#8b5cf6",
      theme: {
        en: "Thought patterns",
        fr: "Schémas de pensée",
        ar: "أنماط التفكير",
      },
      sessions: [
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
        },
      ],
    },
    {
      weekNumber: 4,
      color: "#d97706",
      theme: {
        en: "Building resilience",
        fr: "Renforcer sa résilience",
        ar: "بناء المرونة",
      },
      sessions: [
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
        },
      ],
    },
  ],
}

export function getProgramById(programId: string) {
  return programId === ANXIETY_PROGRAM.id ? ANXIETY_PROGRAM : null
}

export function findSession(program: Program, sessionId: string) {
  for (const week of program.weeks) {
    const session = week.sessions.find((s) => s.id === sessionId)
    if (session) return { session, week }
  }
  return null
}

export function allSessionIds(program: Program): string[] {
  return program.weeks.flatMap((w) => w.sessions.map((s) => s.id))
}
