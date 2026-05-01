import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

describe('Newsletter.vue accessibility', () => {
  let Newsletter: any;

  it('has label associated with email input', async () => {
    const mod = await import('../../src/components/Newsletter.vue');
    Newsletter = mod.default;
    
    const wrapper = mount(Newsletter);
    const label = wrapper.find('label[for="newsletter-email"]');
    const input = wrapper.find('#newsletter-email');
    
    expect(label.exists()).toBe(true);
    expect(input.exists()).toBe(true);
    expect(label.attributes('for')).toBe('newsletter-email');
  });

  it('label is sr-only (visually hidden but accessible)', async () => {
    const mod = await import('../../src/components/Newsletter.vue');
    Newsletter = mod.default;
    
    const wrapper = mount(Newsletter);
    const label = wrapper.find('label[for="newsletter-email"]');
    
    expect(label.classes()).toContain('sr-only');
  });
});