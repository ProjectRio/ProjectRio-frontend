import Link from 'next/link';
import { PageHeader, Panel, PanelHeader } from '@/components/ui';

export const metadata = { title: 'Setup Tutorial' };

export default function TutorialPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-8">
			<PageHeader kicker="Rio Online" title="Setup Tutorial" />
			<p className="text-fog-300">
				A guide to getting Project Rio set up and ready for online play. Looking to squeeze out more
				performance? See the{' '}
				<Link href="/rio-online/optimize" className="text-star-400 hover:text-star-300">
					Optimization Guide
				</Link>
				.
			</p>

			<Panel>
				<PanelHeader title="Getting Started" />
				<div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-fog-300">
					<p>
						The first step is to download{' '}
						<a
							href="https://github.com/ProjectRio/ProjectRio/releases/latest"
							target="_blank"
							rel="noreferrer"
							className="text-star-400 hover:text-star-300"
						>
							Project Rio
						</a>
						. Next, open the program and set a game directory by double-clicking where it prompts you and
						finding the folder which contains the Mario Superstar Baseball ISO (the ISO does not come with
						Project Rio and must be obtained separately). Once this is done, Mario Superstar Baseball should
						be visible in Project Rio. Make sure you do not have a .nkit.iso file — if your game&apos;s file
						size is not 1.36 GB, you have the wrong file.
					</p>
					<p>
						Now set up your controller. You don&apos;t need a GameCube controller, but it is recommended.
						You&apos;ll need a GameCube → USB adapter (official Wii U or Mayflash recommended) and the proper
						drivers. Windows users should download Zadig; tutorials for other platforms are{' '}
						<a
							href="https://wiki.dolphin-emu.org/index.php?title=How_to_use_the_Official_GameCube_Controller_Adapter_for_Wii_U_in_Dolphin#Avoid_vJoy"
							target="_blank"
							rel="noreferrer"
							className="text-star-400 hover:text-star-300"
						>
							found here
						</a>
						. It is also recommended to overclock your controller, which is{' '}
						<a
							href="https://docs.google.com/document/d/1cQ3pbKZm_yUtcLK9ZIXyPzVbTJkvnfxKIyvuFMwzWe0/edit"
							target="_blank"
							rel="noreferrer"
							className="text-star-400 hover:text-star-300"
						>
							detailed here
						</a>
						.
					</p>
					<p>
						The last step is optional but recommended: optimize your performance by following{' '}
						<a
							href="https://blippi.gg/optimize"
							target="_blank"
							rel="noreferrer"
							className="text-star-400 hover:text-star-300"
						>
							this guide
						</a>
						.
					</p>
				</div>
			</Panel>

			<Panel>
				<PanelHeader title="What are Local Players?" />
				<div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-fog-300">
					<p>
						On the top right of the Project Rio toolbar there is a button for &quot;Local Players&quot;, which
						brings up a widget for each of the four ports. This system feeds the stat files: add a
						player&apos;s name in the &quot;Username&quot; box after clicking &quot;Add Players&quot;, then
						assign that username to any of the four ports. Generated stat files label each port by the
						assigned local player.
					</p>
					<p>When playing NetPlay, the player set to Player 1 is the one used for NetPlay stat files.</p>
				</div>
			</Panel>

			<Panel>
				<PanelHeader title="Playing NetPlay" />
				<div className="space-y-4 px-5 py-4 text-sm leading-relaxed text-fog-300">
					<p>
						To start an online game, click &quot;Online Play&quot;. At the top you can select your name and
						the connection type — use &quot;Traversal Server&quot; (the default). Click &quot;Host&quot; and
						wait for players to join. All players must join the lobby before starting; once the game begins
						nobody else can join. If someone wants to spectate, the host should remove that player&apos;s
						port so the spectator doesn&apos;t cause extra lag.
					</p>
					<p>There are two network settings to choose from:</p>
					<dl className="space-y-3">
						<div>
							<dt className="font-semibold text-fog-100">Auto Golf Mode</dt>
							<dd>
								Allows one player (the golfer) to have zero input delay and no lag spikes while the other
								player takes a greater latency penalty. The batter is automatically the golfer while
								batting/pitching, and the fielder while fielding/baserunning.
							</dd>
						</div>
						<div>
							<dt className="font-semibold text-fog-100">Fair Input Delay</dt>
							<dd>
								Gives all players the same input delay throughout the game. A buffer of 4 equals one frame
								of input delay.
							</dd>
						</div>
					</dl>
					<p>
						If you are playing a serious game with standard competitive rules to be counted on the Ranked
						NetPlay ladder, mark the game as Ranked. Ranked games automatically enable the competitive gecko
						codes, block other mods, and apply a 10-second pitch clock. Checking it does not affect your
						rating; it only helps sort stat files in the database.
					</p>
				</div>
			</Panel>

			<Panel>
				<PanelHeader title="Troubleshooting" />
				<div className="space-y-3 px-5 py-4 text-sm leading-relaxed text-fog-300">
					<details className="rounded-lg border border-night-700 p-3">
						<summary className="cursor-pointer font-semibold text-fog-100">
							&quot;Both our connections are good but the game still lags&quot;
						</summary>
						<ol className="mt-3 list-decimal space-y-2 pl-5">
							<li>
								Properly fullscreen the game: Emulation → Toggle Fullscreen (or set a hotkey, or enable
								&quot;Start in Fullscreen&quot; in Graphics).
							</li>
							<li>Lower the internal resolution: Graphics → Enhancements → Internal Resolution → Native.</li>
							<li>On macOS, switch the video backend to Vulkan (not OpenGL). On other platforms keep OpenGL.</li>
							<li>On a laptop, connect to a power source — laptops are a common factor in these problems.</li>
						</ol>
					</details>
					<details className="rounded-lg border border-night-700 p-3">
						<summary className="cursor-pointer font-semibold text-fog-100">
							&quot;My inputs don&apos;t feel like they go through correctly&quot;
						</summary>
						<p className="mt-2">Overclock your controller — see the link in Getting Started.</p>
					</details>
					<details className="rounded-lg border border-night-700 p-3">
						<summary className="cursor-pointer font-semibold text-fog-100">
							&quot;Dolphin says someone has the wrong version&quot;
						</summary>
						<p className="mt-2">
							Someone&apos;s game file is an nkit.iso instead of a plain .iso. Check the game&apos;s file
							size in Dolphin — if it is not exactly 1.36 GB, it&apos;s an nkit.iso and must be converted.
						</p>
					</details>
				</div>
			</Panel>
		</div>
	);
}
