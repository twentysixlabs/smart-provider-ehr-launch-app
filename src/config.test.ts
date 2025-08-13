import { describe, it, expect } from 'vitest';
import config from './config.json';

describe('Config', () => {
  it('should have CLIENT_ID set to <YOUR_CLIENT_ID>', () => {
    expect(config.CLIENT_ID).toBe('<YOUR_CLIENT_ID>');
  });
});