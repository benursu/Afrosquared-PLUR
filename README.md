# P.L.U.R
## Freestyle in this AR Dance Arcade on Instagram
![PLUR](https://s3-us-west-2.amazonaws.com/www.afrosquared.com/devpost/plur/plur.png?v=1)


## Facebook Hackathon Submission
P.L.U.R is a one of a kind AR Dance Arcade created for a Facebook Hackathon (Augment your world with Spark AR).  Users can either choose the default character or play themselves by capturing their own freestyle moves with a segmentation sprite sheet tool.  Once the character is captured, the audio reactive game begins.  A dance floor is placed in your environment and the user controls their character with an on-screen slider making them dance to the beat.  As you dance, the effect utilizes processed midi data to generate falling notes that you catch as the beats drop.  The more notes you catch, the higher your score gets.  Share your game with friends using Reels or use the effect with your own music to record a unique dance experience.

### Instagram Effect Link:
[https://www.instagram.com/ar/330180728028971/?ch=ZDE5ZjI1MmIxNzc1NjFjNzBiNDdiOGUzOTc5ZDcxMTc%3D](https://www.instagram.com/ar/330180728028971/?ch=ZDE5ZjI1MmIxNzc1NjFjNzBiNDdiOGUzOTc5ZDcxMTc%3D)

### Demo Video:
[https://youtu.be/iHCXFk0-GQU](https://youtu.be/iHCXFk0-GQU)

### Facebook Hackathon Devpost:
[https://devpost.com/software/p-l-u-r](https://devpost.com/software/p-l-u-r)

## Music
Music produced by Monro.
[https://monro.lnk.to/Shinkansen/](https://monro.lnk.to/Shinkansen/)

## Spark AR Studio
This project was built using Spark AR Studio v94.

## Midi Processing and Export Tool
1. Record Midi or use online tool at https://onlinesequencer.net/import
2. Convert Midi to text using "TimestampType Absolute" setting at http://flashmusicgames.com/midi/mid2txt.php
3. Copy Midi text information into "/Audio/Export/public/midi/plur.txt"
4. Command line to "/Audio/Export"
5. Run "npm install"
6. Run "node server.js"
7. Browse to "http://localhost:3000" and open console
8. In order click "1. Load Notes", "2. Export Notes", "3. Reload", "4. Load Notes Particles", "5. Export Notes Particles"
9. Import "/Audio/Export/public/notes.obj" and "/Audio/Export/public/notesParticles.dae" in Spark AR.
10. Update script.js with variables consoled in log.

