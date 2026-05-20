import { vi } from 'vitest';
import { maplibreGLMock } from './page.svelte.spec';

vi.mock('maplibre-gl', () => ({ default: maplibreGLMock }));
vi.mock('pmtiles', () => ({
	Protocol: class {
		tile() {}
	}
}));
