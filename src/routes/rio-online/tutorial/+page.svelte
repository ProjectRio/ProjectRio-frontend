<script lang="ts">
    import type { PageData } from './$types';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    export let data: PageData;
</script>
<div class="flex-col m-2 p-2">
    <div class="flex-column justify-center m-2 p-2 card bg-initial mb-8">
        <h1 class="h1 flex justify-center card variant-ringed-tertiary m-2 p-2">Tutorial</h1>
        <h3 class="h3 m-2 p-2">Here is a guide on how to get Project Rio set up on your computer and how to get ready to play online. If you are looking for a guide on how to optimize your system, see the <a class="anchor" href="/rio-online/optimize">Optimization Guide.</a></h3>
    </div>
    <div class="flex-column justify-center m-2 p-2 card variant-filled-sucess mb-8">
        <h2 class="h2 flex justify-center card variant-ringed-tertiary m-2 p-2">Getting Started</h2>
        <p class="justify-center m-2 p-2">
            The first step is to download <a class="anchor " href="https://github.com/ProjectRio/ProjectRio/releases/latest">Project Rio.</a> Next, open the program and set a game directory. This is done by double clicking on the the program where it prompts you, and finding the folder which contains the Mario Superstar Baseball ISO (the ISO does not come with Project Rio and must be obtained separately). Once this is done, Mario Superstar Baseball should be visible in Project Rio. Make sure you do not have a .nkit.iso file. If your game's file size is not 1.36 Gb, you have the wrong file.
        </p>
        <p class="justify-center m-2 p-2">
            Now it's time to set up your controller. You don't need to use a GameCube controller, but it is recommended. You'll need a GameCube -> USB adapter (official WiiU or Mayflash are recommended). You'll also need to install the proper drivers. For windows users, download Zadig and for other OS users, tutorials are found <a class="anchor  " href="https://www.google.com/url?q=https%3A%2F%2Fwiki.dolphin-emu.org%2Findex.php%3Ftitle%3DHow_to_use_the_Official_GameCube_Controller_Adapter_for_Wii_U_in_Dolphin%23Avoid_vJoy&sa=D&sntz=1&usg=AOvVaw3A30S1pTzK1miEdXWjU7EK">here.</a> For more information on configuring your controller, follow this guide. It is also recommended to Overclock your controller, which is <a class="anchor  " href="https://docs.google.com/document/d/1cQ3pbKZm_yUtcLK9ZIXyPzVbTJkvnfxKIyvuFMwzWe0/edit">detailed here.</a>
        </p>
        <p class="justify-center m-2 p-2">
            The last step is optional, but it is recommended that you optimize your performance by following <a class="anchor " href="https://www.google.com/url?q=https%3A%2F%2Fblippi.gg%2Foptimize&sa=D&sntz=1&usg=AOvVaw0576SGPz2HZIcSHZLtYiM-">this guide</a> and/or following the <a href="/rio-online/optimize">Optimization Guide</a> posted on this site.
        </p>
    </div>
    <div class="flex-column justify-center m-2 p-2 card  mb-8">
        <h2 class="h2 flex justify-center card variant-ringed-tertiary m-2 p-2">What are Local Players?</h2>
        <p class="justify-center m-2 p-2">
            On the top right of the Project Rio toolbar, there is a button for "Local Players" which brings up a widget for each of the four ports. This system is for the stat files. Basically, add a player's name/tag in the "Username" box after clicking "Add Players" and saving the name. Once this is done, you can assign that username to any of the four ports. When a stat file is generated, the stat file will label the ports by the local player assigned in the Local Players widget. For example, if  Player 1 is assigned to "a" and Player 2 is assigned to "b", then the stat file generated for a game between player 1 and player 2 will label P1 as "a" and P2 as "b". 
        </p>
        <p class="justify-center m-2 p-2">When playing NetPlay, the player set to Player 1 will be the one used for NetPlay stat files.</p>
    </div>
    <div class="flex-column justify-center m-2 p-2 card  mb-8">
    <h2 class="h2 flex justify-center card variant-ringed-tertiary m-2 p-2">Playing Netplay</h2>
        <p class="justify-center m-2 p-2">
            To start an online game, click "Online Play." At the top you can select your name and the connection type. You should use "Transversal Server"(the default). Click "Host" then wait for players to join. All players must join the lobby before starting the game. If the game begins, no one else can join. If someone wants to spectate the game, the host should remove that players port so that the spectator doesn't cause extra lag.
        </p>
        <p class="justify-center m-2 p-2">
            To join an online game, click "Online Play" and then join the lobby you want.
        </p>
        <p class="justify-center m-2 p-2">
            There are two Network settings to choose from: <strong>Auto Golf Mode</strong> and <strong>Fair Input Delay.</strong>
        </p>
        <ul class="list card justify-center m-2 p-2 variant-ghost-secondary">
            <Accordion>
                <AccordionItem>
                    <span slot="summary" class="flex"><strong>Auto Golf Mode</strong></span>
                    <span slot="content" >Allows one player (the golfer) to have 0 input delay & no lag spikes, while the other player will have a greater latency penalty. With Auto Golf Mode, the batting player is automatically set to the golfer when in the batting/pitching state, then the fielder is automatically set to the golfer when in the fielding/baserunning state.</span>
                </AccordionItem>
                <AccordionItem>
                    <span slot="summary" class="flex"><strong>Fair Input Delay</strong></span>
                    <span slot="content">Gives all players the same amount of input delay throughout the game. A buffer of 4 is equivalent to one frame of input delay.</span>
                </AccordionItem>
            </Accordion>
        </ul>
        <p class="justify-center m-2 p-2">
            Lastly, if you are playing a "serious" game with standard competitive rules that is to be counted on our Ranked NetPlay ladder, you may mark the game as a Ranked game. Ranked games will automatically enable our competitive gecko codes and block any other mods from being used, as well as apply a 10 second pitch clock. If not playing a serious game, this setting can be left unchecked. <strong>Checking it does not affect your rating</strong>; it only helps us sort through stat files in the database more efficiently. 
        </p>
        <p class="justify-center m-2 p-2">
            Now, just click Start and begin playing.
        </p>
    </div>
    <div class="flex-column justify-center m-2 p-2 card mb-8">

        <h2 class="h2 flex justify-center card variant-ringed-primary m-2 p-2">Troubleshooting</h2>
        <ul class="list card justify-center m-2 p-2 variant-ghost-primary">
        <Accordion>
            <AccordionItem>
                <span slot="summary" class="flex"><strong>"Both my and my opponent's internet speeds are good but our game is still lagging. What can we do?"
                </strong></span>
                <span slot="content" class="flex">
                    <AccordionItem>
                        <span slot="summary" class="flex justify-center">The most common cause for this is hardware limitations. Even if the internet is ok, if your game is running slowly then both players will experience bad online play. There are a number of things you can do to fix this:</span>
                        <ol class="list flex-col  justify-center m-2 p-2" slot="content">
                            <li class="justify-center m-2 p-2  variant-ghost-tertiary">
                                <span>1.</span>
                                <span>                                
                                    Make sure you properly fullscreen the game. If you play in windowed mode or if you just click the square in the top right, you will not get the most out of your system. Fullscreen the game by opening Dolphin, starting the game, then clicking "Emulation > Toggle Fullscreen." You can also make a hotkey by clicking "Options>Hotkey Settings" or go to "Graphics" and click "Start in Fullscreen."</span>
                                </li>
                            <li class="justify-center m-2 p-2  variant-ghost-tertiary">
                                <span>2.</span>
                                <span>
                                    Lower your game resolution. This will immensely help slow computers with handling Dolphin Emulator. When Dolphin is open, click Graphics>Enhancements>Internal Resolution. Lower your resolution to "Native"
                                </span>
                            </li>
                            <li class="justify-center m-2 p-2 variant-ghost-tertiary">
                                <span>3.</span>
                                <span>
                                    If you play on macOS, switch your video backend (in graphics settings) to Vulkan (NOT OpenGL!!). OpenGL gives bad performance to macOS users. If you are not on macOS, keep your video backend on OpenGL.</span>
                            </li>
                            <li class="justify-center m-2 p-2 variant-ghost-tertiary">
                                <span>4.</span>
                                <span>If on laptop, connect to a power source. <span><strong> IF YOU PLAY ON A LAPTOP, FOLLOW THE STEPS LISTED ABOVE.</strong></span><span> Laptops are a common factor with these problems.</span></span>
                            </li>
                        </ol>
                    </AccordionItem>
                </span>
                <AccordionItem>

            </AccordionItem>
            </AccordionItem>
        </Accordion>
        </ul>

        <Accordion>
            <ul class="list card justify-center m-2 p-2 variant-ghost-primary">

            <AccordionItem>
                <span slot="summary"><strong>"My inputs don't feel like they are going through correctly"
                </strong></span>
                <span slot="content">This usually means that you should overclock your controller. Details on this are listed earlier in this guide.
                </span>
            </AccordionItem>
            </ul>
            <ul class="list card justify-center m-2 p-2 variant-ghost-primary">

            <AccordionItem>
                <span slot="summary"><strong>"I am trying to play, but Dolphin says someone has the wrong version"
                </strong></span>
                <span slot="content">Someone's game file is an nkit.iso instead of an .iso. nkit.iso is a compressed .iso file, so most programs will just tell you that all nkit.iso's are just .iso's. Open dolphin emulator and check the game's file size. If it is not exactly 1.36 GB, you have an nkit.iso. Convert it to .iso using the steps listed earlier.</span>
            </AccordionItem>
            </ul>
        </Accordion>



    </div>
</div>

<style>
    a {
        color: rgba(var(--text-neutral-500) / 1) !important;
    }

</style>