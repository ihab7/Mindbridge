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

  // ── English — public-domain literary classics (full original text, Project Gutenberg) ──
  {
    slug: "the-selfish-giant",
    language: "en",
    category: "classic",
    title: "The Selfish Giant",
    subtitle: "Oscar Wilde · 1888",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/the-selfish-giant.mp3",
    durationSec: 578,
    defaultAmbient: "forest",
    coverGradient: "linear-gradient(160deg,#1a2e2a,#2a4a40,#3d6356)",
    scriptText: `Every afternoon, as they were coming from school, the children used to go and play in the Giant’s garden.

It was a large lovely garden, with soft green grass. Here and there over the grass stood beautiful flowers like stars, and there were twelve peach-trees that in the spring-time broke out into delicate blossoms of pink and pearl, and in the autumn bore rich fruit. The birds sat on the trees and sang so sweetly that the children used to stop their games in order to listen to them. “How happy we are here!” they cried to each other.

One day the Giant came back. He had been to visit his friend the Cornish ogre, and had stayed with him for seven years. After the seven years were over he had said all that he had to say, for his conversation was limited, and he determined to return to his own castle. When he arrived he saw the children playing in the garden.

“What are you doing here?” he cried in a very gruff voice, and the children ran away.

“My own garden is my own garden,” said the Giant; “any one can understand that, and I will allow nobody to play in it but myself.” So he built a high wall all round it, and put up a notice-board.

TRESPASSERS

WILL BE

PROSECUTED

He was a very selfish Giant.

The poor children had now nowhere to play. They tried to play on the road, but the road was very dusty and full of hard stones, and they did not like it. They used to wander round the high wall when their lessons were over, and talk about the beautiful garden inside. “How happy we were there,” they said to each other.

Then the Spring came, and all over the country there were little blossoms and little birds. Only in the garden of the Selfish Giant it was still winter. The birds did not care to sing in it as there were no children, and the trees forgot to blossom. Once a beautiful flower put its head out from the grass, but when it saw the notice-board it was so sorry for the children that it slipped back into the ground again, and went off to sleep. The only people who were pleased were the Snow and the Frost. “Spring has forgotten this garden,” they cried, “so we will live here all the year round.” The Snow covered up the grass with her great white cloak, and the Frost painted all the trees silver. Then they invited the North Wind to stay with them, and he came. He was wrapped in furs, and he roared all day about the garden, and blew the chimney-pots down. “This is a delightful spot,” he said, “we must ask the Hail on a visit.” So the Hail came. Every day for three hours he rattled on the roof of the castle till he broke most of the slates, and then he ran round and round the garden as fast as he could go. He was dressed in grey, and his breath was like ice.

“I cannot understand why the Spring is so late in coming,” said the Selfish Giant, as he sat at the window and looked out at his cold white garden; “I hope there will be a change in the weather.”

But the Spring never came, nor the Summer. The Autumn gave golden fruit to every garden, but to the Giant’s garden she gave none. “He is too selfish,” she said. So it was always Winter there, and the North Wind, and the Hail, and the Frost, and the Snow danced about through the trees.

One morning the Giant was lying awake in bed when he heard some lovely music. It sounded so sweet to his ears that he thought it must be the King’s musicians passing by. It was really only a little linnet singing outside his window, but it was so long since he had heard a bird sing in his garden that it seemed to him to be the most beautiful music in the world. Then the Hail stopped dancing over his head, and the North Wind ceased roaring, and a delicious perfume came to him through the open casement. “I believe the Spring has come at last,” said the Giant; and he jumped out of bed and looked out.

What did he see?

He saw a most wonderful sight. Through a little hole in the wall the children had crept in, and they were sitting in the branches of the trees. In every tree that he could see there was a little child. And the trees were so glad to have the children back again that they had covered themselves with blossoms, and were waving their arms gently above the children’s heads. The birds were flying about and twittering with delight, and the flowers were looking up through the green grass and laughing. It was a lovely scene, only in one corner it was still winter. It was the farthest corner of the garden, and in it was standing a little boy. He was so small that he could not reach up to the branches of the tree, and he was wandering all round it, crying bitterly. The poor tree was still quite covered with frost and snow, and the North Wind was blowing and roaring above it. “Climb up! little boy,” said the Tree, and it bent its branches down as low as it could; but the boy was too tiny.

And the Giant’s heart melted as he looked out. “How selfish I have been!” he said; “now I know why the Spring would not come here. I will put that poor little boy on the top of the tree, and then I will knock down the wall, and my garden shall be the children’s playground for ever and ever.” He was really very sorry for what he had done.

So he crept downstairs and opened the front door quite softly, and went out into the garden. But when the children saw him they were so frightened that they all ran away, and the garden became winter again. Only the little boy did not run, for his eyes were so full of tears that he did not see the Giant coming. And the Giant stole up behind him and took him gently in his hand, and put him up into the tree. And the tree broke at once into blossom, and the birds came and sang on it, and the little boy stretched out his two arms and flung them round the Giant’s neck, and kissed him. And the other children, when they saw that the Giant was not wicked any longer, came running back, and with them came the Spring. “It is your garden now, little children,” said the Giant, and he took a great axe and knocked down the wall. And when the people were going to market at twelve o’clock they found the Giant playing with the children in the most beautiful garden they had ever seen.

All day long they played, and in the evening they came to the Giant to bid him good-bye.

“But where is your little companion?” he said: “the boy I put into the tree.” The Giant loved him the best because he had kissed him.

“We don’t know,” answered the children; “he has gone away.”

“You must tell him to be sure and come here to-morrow,” said the Giant. But the children said that they did not know where he lived, and had never seen him before; and the Giant felt very sad.

Every afternoon, when school was over, the children came and played with the Giant. But the little boy whom the Giant loved was never seen again. The Giant was very kind to all the children, yet he longed for his first little friend, and often spoke of him. “How I would like to see him!” he used to say.

Years went over, and the Giant grew very old and feeble. He could not play about any more, so he sat in a huge armchair, and watched the children at their games, and admired his garden. “I have many beautiful flowers,” he said; “but the children are the most beautiful flowers of all.”

One winter morning he looked out of his window as he was dressing. He did not hate the Winter now, for he knew that it was merely the Spring asleep, and that the flowers were resting.

Suddenly he rubbed his eyes in wonder, and looked and looked. It certainly was a marvellous sight. In the farthest corner of the garden was a tree quite covered with lovely white blossoms. Its branches were all golden, and silver fruit hung down from them, and underneath it stood the little boy he had loved.

Downstairs ran the Giant in great joy, and out into the garden. He hastened across the grass, and came near to the child. And when he came quite close his face grew red with anger, and he said, “Who hath dared to wound thee?” For on the palms of the child’s hands were the prints of two nails, and the prints of two nails were on the little feet.

“Who hath dared to wound thee?” cried the Giant; “tell me, that I may take my big sword and slay him.”

“Nay!” answered the child; “but these are the wounds of Love.”

“Who art thou?” said the Giant, and a strange awe fell on him, and he knelt before the little child.

And the child smiled on the Giant, and said to him, “You let me play once in your garden, to-day you shall come with me to my garden, which is Paradise.”

And when the children ran in that afternoon, they found the Giant lying dead under the tree, all covered with white blossoms.`,
  },
  {
    slug: "the-gift-of-the-magi",
    language: "en",
    category: "classic",
    title: "The Gift of the Magi",
    subtitle: "O. Henry · 1905",
    narratorName: "Synthesized narration",
    audioSrc: "/sleep-stories/classics/the-gift-of-the-magi.mp3",
    durationSec: 807,
    defaultAmbient: "fire",
    coverGradient: "linear-gradient(160deg,#2c1e14,#4a3020,#664430)",
    scriptText: `One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one’s cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.

There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.

While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home. A furnished flat at $8 per week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad.

In the vestibule below was a letter-box into which no letter would go, and an electric button from which no mortal finger could coax a ring. Also appertaining thereunto was a card bearing the name “Mr. James Dillingham Young.”

The “Dillingham” had been flung to the breeze during a former period of prosperity when its possessor was being paid $30 per week. Now, when the income was shrunk to $20, though, they were thinking seriously of contracting to a modest and unassuming D. But whenever Mr. James Dillingham Young came home and reached his flat above he was called “Jim” and greatly hugged by Mrs. James Dillingham Young, already introduced to you as Della. Which is all very good.

Della finished her cry and attended to her cheeks with the powder rag. She stood by the window and looked out dully at a gray cat walking a gray fence in a gray backyard. Tomorrow would be Christmas Day, and she had only $1.87 with which to buy Jim a present. She had been saving every penny she could for months, with this result. Twenty dollars a week doesn’t go far. Expenses had been greater than she had calculated. They always are. Only $1.87 to buy a present for Jim. Her Jim. Many a happy hour she had spent planning for something nice for him. Something fine and rare and sterling—something just a little bit near to being worthy of the honor of being owned by Jim.

There was a pier glass between the windows of the room. Perhaps you have seen a pier glass in an $8 flat. A very thin and very agile person may, by observing his reflection in a rapid sequence of longitudinal strips, obtain a fairly accurate conception of his looks. Della, being slender, had mastered the art.

Suddenly she whirled from the window and stood before the glass. Her eyes were shining brilliantly, but her face had lost its color within twenty seconds. Rapidly she pulled down her hair and let it fall to its full length.

Now, there were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim’s gold watch that had been his father’s and his grandfather’s. The other was Della’s hair. Had the queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty’s jewels and gifts. Had King Solomon been the janitor, with all his treasures piled up in the basement, Jim would have pulled out his watch every time he passed, just to see him pluck at his beard from envy.

So now Della’s beautiful hair fell about her rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.

On went her old brown jacket; on went her old brown hat. With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.

Where she stopped the sign read: “Mme. Sofronie. Hair Goods of All Kinds.” One flight up Della ran, and collected herself, panting. Madame, large, too white, chilly, hardly looked the “Sofronie.”

“Will you buy my hair?” asked Della.

“I buy hair,” said Madame. “Take yer hat off and let’s have a sight at the looks of it.”

Down rippled the brown cascade.

“Twenty dollars,” said Madame, lifting the mass with a practised hand.

“Give it to me quick,” said Della.

Oh, and the next two hours tripped by on rosy wings. Forget the hashed metaphor. She was ransacking the stores for Jim’s present.

She found it at last. It surely had been made for Jim and no one else. There was no other like it in any of the stores, and she had turned all of them inside out. It was a platinum fob chain simple and chaste in design, properly proclaiming its value by substance alone and not by meretricious ornamentation—as all good things should do. It was even worthy of The Watch. As soon as she saw it she knew that it must be Jim’s. It was like him. Quietness and value—the description applied to both. Twenty-one dollars they took from her for it, and she hurried home with the 87 cents. With that chain on his watch Jim might be properly anxious about the time in any company. Grand as the watch was, he sometimes looked at it on the sly on account of the old leather strap that he used in place of a chain.

When Della reached home her intoxication gave way a little to prudence and reason. She got out her curling irons and lighted the gas and went to work repairing the ravages made by generosity added to love. Which is always a tremendous task, dear friends—a mammoth task.

Within forty minutes her head was covered with tiny, close-lying curls that made her look wonderfully like a truant schoolboy. She looked at her reflection in the mirror long, carefully, and critically.

“If Jim doesn’t kill me,” she said to herself, “before he takes a second look at me, he’ll say I look like a Coney Island chorus girl. But what could I do—oh! what could I do with a dollar and eighty-seven cents?”

At 7 o’clock the coffee was made and the frying-pan was on the back of the stove hot and ready to cook the chops.

Jim was never late. Della doubled the fob chain in her hand and sat on the corner of the table near the door that he always entered. Then she heard his step on the stair away down on the first flight, and she turned white for just a moment. She had a habit of saying a little silent prayer about the simplest everyday things, and now she whispered: “Please God, make him think I am still pretty.”

The door opened and Jim stepped in and closed it. He looked thin and very serious. Poor fellow, he was only twenty-two—and to be burdened with a family! He needed a new overcoat and he was without gloves.

Jim stopped inside the door, as immovable as a setter at the scent of quail. His eyes were fixed upon Della, and there was an expression in them that she could not read, and it terrified her. It was not anger, nor surprise, nor disapproval, nor horror, nor any of the sentiments that she had been prepared for. He simply stared at her fixedly with that peculiar expression on his face.

Della wriggled off the table and went for him.

“Jim, darling,” she cried, “don’t look at me that way. I had my hair cut off and sold because I couldn’t have lived through Christmas without giving you a present. It’ll grow out again—you won’t mind, will you? I just had to do it. My hair grows awfully fast. Say ‘Merry Christmas!’ Jim, and let’s be happy. You don’t know what a nice—what a beautiful, nice gift I’ve got for you.”

“You’ve cut off your hair?” asked Jim, laboriously, as if he had not arrived at that patent fact yet even after the hardest mental labor.

“Cut it off and sold it,” said Della. “Don’t you like me just as well, anyhow? I’m me without my hair, ain’t I?”

Jim looked about the room curiously.

“You say your hair is gone?” he said, with an air almost of idiocy.

“You needn’t look for it,” said Della. “It’s sold, I tell you—sold and gone, too. It’s Christmas Eve, boy. Be good to me, for it went for you. Maybe the hairs of my head were numbered,” she went on with sudden serious sweetness, “but nobody could ever count my love for you. Shall I put the chops on, Jim?”

Out of his trance Jim seemed quickly to wake. He enfolded his Della. For ten seconds let us regard with discreet scrutiny some inconsequential object in the other direction. Eight dollars a week or a million a year—what is the difference? A mathematician or a wit would give you the wrong answer. The magi brought valuable gifts, but that was not among them. This dark assertion will be illuminated later on.

Jim drew a package from his overcoat pocket and threw it upon the table.

“Don’t make any mistake, Dell,” he said, “about me. I don’t think there’s anything in the way of a haircut or a shave or a shampoo that could make me like my girl any less. But if you’ll unwrap that package you may see why you had me going a while at first.”

White fingers and nimble tore at the string and paper. And then an ecstatic scream of joy; and then, alas! a quick feminine change to hysterical tears and wails, necessitating the immediate employment of all the comforting powers of the lord of the flat.

For there lay The Combs—the set of combs, side and back, that Della had worshipped long in a Broadway window. Beautiful combs, pure tortoise shell, with jewelled rims—just the shade to wear in the beautiful vanished hair. They were expensive combs, she knew, and her heart had simply craved and yearned over them without the least hope of possession. And now, they were hers, but the tresses that should have adorned the coveted adornments were gone.

But she hugged them to her bosom, and at length she was able to look up with dim eyes and a smile and say: “My hair grows so fast, Jim!”

And then Della leaped up like a little singed cat and cried, “Oh, oh!”

Jim had not yet seen his beautiful present. She held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit.

“Isn’t it a dandy, Jim? I hunted all over town to find it. You’ll have to look at the time a hundred times a day now. Give me your watch. I want to see how it looks on it.”

Instead of obeying, Jim tumbled down on the couch and put his hands under the back of his head and smiled.

“Dell,” said he, “let’s put our Christmas presents away and keep ’em a while. They’re too nice to use just at present. I sold the watch to get the money to buy your combs. And now suppose you put the chops on.”

The magi, as you know, were wise men—wonderfully wise men—who brought gifts to the Babe in the manger. They invented the art of giving Christmas presents. Being wise, their gifts were no doubt wise ones, possibly bearing the privilege of exchange in case of duplication. And here I have lamely related to you the uneventful chronicle of two foolish children in a flat who most unwisely sacrificed for each other the greatest treasures of their house. But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest. Of all who give and receive gifts, such as they are wisest. Everywhere they are wisest. They are the magi.`,
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
