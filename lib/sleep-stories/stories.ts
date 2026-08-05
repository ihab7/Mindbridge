// Sleep Stories content: a plain, static module instead of a database table.
// Stories never change per user or per request, so they belong in the repo
// as build-time content, not behind a publish-flag workflow. Add new
// entries directly to SLEEP_STORIES below; there is no sync step.

export type SleepStory = {
  slug: string
  category: "hekaya" | "classic"
  language: "ar" | "en" | "fr"
  title: string
  subtitle?: string
  openerLine?: string
  scriptText: string
  narratorName: string
  audioSrc: string | null // null = transcript only, narration not recorded yet
  durationSec?: number
  defaultAmbient: "fire" | "rain" | "ocean" | "forest" | "none" // initial ambient selection only -- overridden by the listener's saved preference once one exists
  coverGradient: string // full CSS gradient string
}

export const SLEEP_STORIES: SleepStory[] = [
  // ── Arabic (hekaya) — real recordings ──
  {
    slug: "essera9-wel-alf-dinar",
    language: "ar",
    category: "hekaya",
    title: "الصراق والألف دينار",
    subtitle: "The Thief and the Thousand Dinars",
    openerLine: "كان يا ما كان...",
    narratorName: "Grandfather recording",
    audioSrc: "/sleep-stories/hekaya/essera9-wel-alf-dinar.mp3",
    durationSec: 453,
    defaultAmbient: "fire",
    coverGradient: "linear-gradient(160deg,#3a1f0f,#6b3410,#8a4a18)",
    scriptText: "[Transcription à venir]",
  },
  {
    slug: "ettajir-ou-oueldou-ou-lashab",
    language: "ar",
    category: "hekaya",
    title: "التاجر وولده والصاحب",
    subtitle: "The Merchant, His Son, and the Friend",
    openerLine: "يُحكى أن...",
    narratorName: "Grandfather recording",
    audioSrc: "/sleep-stories/hekaya/ettajir-ou-oueldou-ou-lashab.mp3",
    durationSec: 923,
    defaultAmbient: "fire",
    coverGradient: "linear-gradient(160deg,#2a1a20,#4a2530,#6b3540)",
    scriptText: "[Transcription à venir]",
  },

  // ── English (classic) — text now, audio later ──
  {
    slug: "cottage-by-the-millpond",
    language: "en",
    category: "classic",
    title: "The Cottage by the Millpond",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/cottage-by-the-millpond.mp3",
    durationSec: 284,
    defaultAmbient: "rain",
    coverGradient: "linear-gradient(160deg,#1a2a38,#2d4256,#3f5a72)",
    scriptText: `In a small cottage beside an old millpond, where the water wheel had long since stopped turning, an old miller kept a single candle burning each night.

He had lived here for a very long time. Long enough that the floorboards knew the shape of his footsteps, and settled quietly beneath him without complaint. Long enough that the door no longer needed a key. Long enough that he had stopped counting the years altogether, which is its own kind of peace.

The mill itself had gone quiet many seasons ago. The great wheel stood still in the water now, softened with green moss, and the water simply moved around it instead of through it, the way a river learns to move around a stone. Nothing was broken. Nothing needed mending. The wheel had simply finished its work, and the water had agreed, and that was all.

Each evening, when the light began to leave the fields, the miller would set his candle on the wide windowsill and sit in the chair beside it. The chair had a worn place where his shoulder always rested. He did not read. He did not plan. He sat, and he looked out at the pond.

The pond was still as glass. Stiller than glass, some nights. It held the whole sky inside it — every star, the slow moon, the drifting clouds — and it held them so gently, so patiently, that you could not tell where the water ended and the sky began. The heavens above, and the heavens below, and the old miller sitting quietly between them.

Sometimes a single leaf would come down from the willow at the water's edge. It would touch the surface, and the sky would shiver, and then slowly, slowly, the pond would gather itself back into stillness. The stars would settle. The moon would smooth out again. And everything would be exactly as it had been, only a little later in the evening.

He liked watching that. The way the water never rushed to be still again. It simply stopped moving, in its own time, when the moving was done.

Out beyond the pond, the fields lay dark and low. Barley, mostly, though it hardly mattered now. The wind moved across them in long slow passes, the way a hand moves over a sleeping animal, and the barley leaned, and rose, and leaned again. If you listened, you could hear it — a soft dry whisper, rising and falling, rising and falling, with no hurry in it at all.

Nearer, in the reeds, a heron stood. It had been standing there since before the sun went down. It would stand there long after. Herons are very good at this. They do not think about how long they have been standing, or how long they will stand. They simply stand, and the water moves past them, and the evening happens around them, and none of it requires their attention.

The candle burned low. The miller did not move to replace it. There was no need. He had watched a great many candles burn down in this room, and each one had given exactly as much light as the evening needed, and then stopped, and the dark that followed had always been a soft dark, and never once unkind.

His hands rested in his lap. His breathing had grown slow and even, the way breathing does when a person has stopped waiting for anything. In and out. In and out. As slow as the wind across the barley. As slow as the leaf settling on the water.

Beyond the window, the pond held the moon. The moon did not move. The stars did not move. The old wheel stood in the water, quiet and green, having finished what it was for.

And the miller's eyes grew heavy, the way eyes do when there is nothing left in the day that needs deciding. He did not fight it. He had never fought it. He let his gaze rest on the water, and the water rested back, and slowly, gently, without any moment you could point to as the moment, he became still.

Still like the pond.

Still like the wheel.

Still like the quiet house around him, and the fields beyond it, and the long soft dark that had already settled over everything, and asked nothing of anyone, and would keep on settling, patiently, all through the night.`,
  },
  {
    slug: "clockmakers-last-hour",
    language: "en",
    category: "classic",
    title: "The Clockmaker's Last Hour",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/clockmakers-last-hour.mp3",
    durationSec: 290,
    defaultAmbient: "none",
    coverGradient: "linear-gradient(160deg,#241f2f,#3a3248,#4f4260)",
    scriptText: `In a narrow shop on a narrow street, an old clockmaker wound his very last clock of the evening, as he had done for sixty years.

The shop was small. Small enough that he could reach almost anything from where he stood. A workbench along one wall, worn smooth and pale in the middle where his forearms had rested through six decades of quiet, careful evenings. A brass lamp with a green glass shade. A drawer of tiny brass things whose names only he remembered, and which he could find in the dark by weight alone.

And clocks. Clocks on every wall, on every shelf, standing in the corners, resting on the bench. Tall ones with long slow pendulums that took their time about everything. Small ones with quick bright ticks like a bird's heartbeat. Clocks with painted faces, clocks with no faces at all, clocks that had come to him broken and stayed on, long after the mending, because no one ever came back for them.

He never rushed. That was the first thing anyone noticed about him. In sixty years, no one had ever seen the clockmaker hurry. His hands moved the way water moves in a slow channel — steadily, without effort, and always exactly where they were going.

He had learned this early. A watch spring is a very small thing, and a very patient thing, and it will not be hurried. It will simply break instead. So he had learned to move at the speed the work required, and after enough years, that had become the speed he moved at everywhere, all the time, in everything.

Now he set the last clock back on its shelf and turned the lamp down low.

And the shop began to speak.

They never ticked together, his clocks. Sixty years and he had never once managed it, and long ago he had stopped trying. They ticked in gentle disagreement, dozens of them, each keeping its own honest time. A soft orchestra of seconds, overlapping, drifting apart, drifting back. Sometimes two would fall into step for a while, just for a while, and then wander apart again, and neither one wrong.

He sat down in the chair by the window and listened.

There was the deep one, the tall case clock by the door, whose pendulum swung so slowly you could count the whole swing — over, and back, and over again. Beneath it, the small quick ones, dozens of them, filling in the spaces like rain on a roof. And somewhere at the back of the shop, one very old clock whose tick had gone soft with age, so soft you could only hear it when everything else happened to fall quiet at the same moment.

He never worried what time it truly was. This is a strange thing to say about a clockmaker, but it was true, and he had thought about why. It was because he had spent his whole life inside the machinery of time, and from the inside, it did not look like a thing that could be gotten wrong. It was only turning. Gears turning other gears. A weight descending, very slowly, doing what weights do. Nothing anxious about any of it.

Outside, the narrow street had gone dark and empty. The last footsteps had passed an hour ago. A little wind came down between the buildings, and the shop sign creaked once on its hinge, and then thought better of it, and was quiet.

The lamp burned lower.

He let his head rest back against the chair. His hands, which had been so precise for so many years, lay open and loose in his lap, doing nothing at all, which they were also very good at.

And he listened to his clocks breathe together. Slower, it seemed to him. Slower and slower, though he knew that could not be true, and did not mind that it could not be true. The quick ones softened. The deep one stretched its long swing longer. Even the loudest of them seemed to lower its voice, the way people do when someone in the room has begun to fall asleep.

Over. And back. And over again.

Tick. And tick. And tick.

Until the whole shop grew as quiet, and as unhurried, and as perfectly patient as sleep itself — every clock in it still turning, still keeping its own good time, asking nothing of him, and carrying the night along gently, without him, all the way through to morning.`,
  },

  // ── French (classic) — text now, audio later ──
  {
    slug: "maison-au-bord-du-verger",
    language: "fr",
    category: "classic",
    title: "La Maison au Bord du Verger",
    narratorName: "Narration de synthèse",
    audioSrc: "/sleep-stories/classics/maison-au-bord-du-verger.mp3",
    durationSec: 277,
    defaultAmbient: "fire",
    coverGradient: "linear-gradient(160deg,#1a2438,#2c3a50,#3e5068)",
    scriptText: `Au bord d'un vieux verger, une petite maison de pierre gardait la chaleur du jour bien après le coucher du soleil.

Les murs étaient épais. C'étaient des murs anciens, montés il y a très longtemps par des gens qui savaient que la pierre met du temps à se réchauffer, et encore plus de temps à se refroidir. Alors le soir venu, quand l'air fraîchissait dehors, la maison rendait doucement tout ce qu'elle avait reçu du soleil, sans se presser, comme si elle avait toute la nuit devant elle. Ce qui était vrai.

À l'intérieur, une grand-mère filait la laine près du feu.

Elle n'avait pas besoin de regarder ses mains. Elle les regardait quand même, parfois, mais sans y penser vraiment. Le geste était devenu quelque chose que le corps faisait tout seul, comme respirer, comme cligner des yeux. La laine passait entre ses doigts, s'enroulait, descendait, s'enroulait encore. Lent et régulier. Lent et régulier, comme une respiration.

Le feu était petit. Elle l'aimait petit. Un grand feu demande de l'attention, il faut le nourrir, le surveiller, le remuer. Un petit feu se contente de ce qu'on lui donne et brûle tranquillement pendant des heures, en faisant ce bruit doux que font les braises quand elles s'installent — un craquement de temps en temps, puis plus rien, puis un autre, sans aucune régularité, sans rien annoncer.

Dehors, le verger.

Les pommiers étaient vieux, plus vieux qu'elle, plantés par quelqu'un dont plus personne ne se souvenait du nom. Leurs branches s'étaient tordues avec les années, chacune à sa façon, et l'hiver on voyait très bien leurs formes contre le ciel, comme des mains ouvertes.

En cette saison, ils laissaient tomber leurs fruits. Un à un. Jamais deux en même temps. Il y avait un long silence, et puis un bruit sourd et doux dans l'herbe, très loin, à peine un bruit. Et puis un autre silence, plus long peut-être. Et puis un autre fruit.

Personne ne les ramassait le soir. Ils attendaient là, dans l'herbe humide, jusqu'au matin. Ils ne se perdaient pas. Une pomme tombée n'est pas une pomme perdue — elle est simplement une pomme qui est arrivée là où elle allait, un peu plus tôt qu'on ne croyait.

Le vent passait entre les arbres, sans force, presque distraitement. Les feuilles bougeaient. Puis s'arrêtaient. Puis bougeaient encore.

Dans la maison, la grand-mère continuait de filer. Le fil s'allongeait entre ses doigts, régulier, sans nœud. Elle n'avait pas de raison de finir ce soir. Il n'y avait rien à finir. Le fil serait là demain, exactement où elle l'aurait laissé, et ses mains sauraient tout de suite où reprendre.

C'était une chose qu'elle disait souvent, autrefois, quand la maison était pleine et que les enfants ne voulaient pas dormir. Elle disait que la nuit n'était pas faite pour finir les choses. Que le jour, oui, le jour était fait pour ça — pour commencer, pour continuer, pour terminer. Mais que la nuit était faite pour autre chose. Pour laisser reposer. Tout doucement. Jusqu'au matin.

Les braises rougissaient et pâlissaient, rougissaient et pâlissaient, sans qu'on puisse deviner pourquoi ni quand.

Ses mains ralentissaient. Elle ne le remarquait pas. Le fil se faisait un peu plus lent entre ses doigts, un peu plus lâche, et le fuseau tournait moins vite, et puis moins vite encore.

Dehors, une pomme tomba dans l'herbe.

Elle attendit longtemps la suivante. Si longtemps qu'elle oublia qu'elle attendait.

Le feu craqua une fois, tout doucement, comme quelqu'un qui s'installe mieux dans son lit. Les murs de pierre continuaient de rendre la chaleur du jour, patiemment, sans se presser, avec toute la nuit devant eux.

Et la vieille femme laissa la laine reposer dans ses mains ouvertes, et sa tête pencha un peu vers l'épaule, et le verger continua tranquillement de laisser tomber ses fruits, un à un, dans l'herbe endormie, tout doucement, jusqu'au matin.`,
  },
  {
    slug: "gardien-du-vieux-phare",
    language: "fr",
    category: "classic",
    title: "Le Gardien du Vieux Phare",
    narratorName: "Narration de synthèse",
    audioSrc: "/sleep-stories/classics/gardien-du-vieux-phare.mp3",
    durationSec: 274,
    defaultAmbient: "ocean",
    coverGradient: "linear-gradient(160deg,#141f2c,#22384c,#2f4d66)",
    scriptText: `Sur la côte bretonne, où les falaises plongent dans une mer grise et patiente, un vieux gardien de phare montait l'escalier de pierre une dernière fois ce soir.

Cent quarante-trois marches. Il les connaissait toutes. Il aurait pu vous dire laquelle était un peu plus haute que les autres — la trente-septième — et laquelle avait une petite fissure dans le coin gauche, et à quel endroit exactement la rampe devenait froide sous la main, parce que le mur là-bas donnait sur le nord.

Il montait lentement. Il avait toujours monté lentement, même jeune, même quand il aurait pu monter vite. Un phare n'est pas un endroit où l'on se dépêche. La lumière tourne, qu'on soit en haut ou en bas. Elle n'attend personne et elle ne manque à personne.

Chaque marche lui était familière, usée par des années de pas tranquilles. Le creux au milieu de la pierre n'avait pas été fait par lui seul — d'autres gardiens étaient montés là avant lui, pendant très longtemps, et chacun avait emporté un peu de pierre sous ses semelles, sans le savoir, année après année. C'était une chose douce à penser. Que tous ces hommes avaient creusé le même escalier simplement en faisant leur travail, calmement, un soir après l'autre.

En bas, les vagues.

Elles parlaient leur vieux langage, celui qu'elles parlaient bien avant qu'il y ait un phare, bien avant qu'il y ait quelqu'un pour l'écouter. Sans hâte. Sans fin. Une vague arrivait, se retirait, une autre arrivait. Jamais tout à fait la même, jamais vraiment différente. Elles ne comptaient pas. Elles ne s'arrêtaient pas pour se reposer. Elles n'allaient nulle part.

Il aimait ce bruit depuis toujours. C'est un bruit qui ne demande rien. Il n'y a pas de message dedans, pas de nouvelle, rien à comprendre. On peut l'écouter pendant des heures et ne rien en retirer du tout, et c'est exactement pour cela qu'il repose.

Il arriva en haut. La chambre de la lanterne était tiède, comme toujours, à cause du mécanisme. Il y avait cette odeur qu'il connaissait par cœur — le laiton, l'huile, un peu de sel qui rentrait malgré les vitres.

Il n'y avait rien à réparer ce soir. Rien à surveiller de trop près. La lumière avait déjà commencé son tour, comme elle le faisait chaque soir depuis plus de cent ans, sans qu'on ait à le lui demander.

Il s'assit sur le petit banc de bois près de la vitre.

Le faisceau sortait dans la nuit, long et pâle, et balayait la mer. Un tour. Puis l'obscurité. Puis un autre tour. La lumière touchait les vagues très loin, les rendait blanches un instant, et passait. Et revenait. Et passait encore.

Il regarda ce mouvement sans y penser. C'était plus facile que de penser. La lumière tournait, régulière, calme, comme quelque chose qui respire — et derrière elle, la mer respirait aussi, plus lentement encore, plus profondément.

Il n'y avait pas de bateaux ce soir. Il n'y en avait pas eu depuis plusieurs jours. Cela ne changeait rien. La lumière tournait quand même, pour personne, dans le noir, et il trouvait que c'était bien ainsi. Certaines choses n'ont pas besoin d'être vues pour être justes.

Le mécanisme faisait son bruit doux au-dessus de lui. Un cliquetis très lent, régulier, presque endormi.

Ses mains reposaient sur ses genoux. Il ne s'était pas rendu compte qu'il avait fermé les yeux, et il ne se donna pas la peine de les rouvrir. La chaleur du laiton, le sel dans l'air, le mécanisme au-dessus, la mer en dessous.

Un tour de lumière. Puis l'obscurité. Puis un autre tour.

Rien à réparer. Rien à surveiller. Juste la lumière qui tournait doucement, et la mer qui respirait, encore et encore, sans hâte, sans fin, tout comme vous respirez maintenant.`,
  },
]

export function getStoriesByLanguage(lang: SleepStory["language"]): SleepStory[] {
  return SLEEP_STORIES.filter((s) => s.language === lang)
}

export function getStoryBySlug(slug: string): SleepStory | null {
  return SLEEP_STORIES.find((s) => s.slug === slug) ?? null
}

export function getAvailableLanguages(): SleepStory["language"][] {
  return Array.from(new Set(SLEEP_STORIES.map((s) => s.language)))
}
