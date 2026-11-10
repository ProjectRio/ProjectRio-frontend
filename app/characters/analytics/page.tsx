import CharacterAnalytics from '@/components/analytics/CharacterAnalytics';

export const metadata = {
	title: 'Character Win Rates',
	description:
		'Which Mario Superstar Baseball characters win more than they should? Filter by mode, roster, captain, player, and rating.'
};

export default function CharacterAnalyticsPage() {
	return <CharacterAnalytics />;
}
