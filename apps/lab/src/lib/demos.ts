// Specimen ids that have a demo component wired up in
// src/pages/specimen/[id].astro. Keep this list in sync with that file.
export const wiredDemoIds = ['uni-plan', 'laz-store', 'brewit']

export function hasWiredDemo(id: string): boolean {
	return wiredDemoIds.includes(id)
}
