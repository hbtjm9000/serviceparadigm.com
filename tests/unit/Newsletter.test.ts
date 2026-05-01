import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

describe('Newsletter.vue', () => {
  let Newsletter: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    const mod = await import('../../src/components/Newsletter.vue');
    Newsletter = mod.default;
  });

  it('renders email input and submit button', async () => {
    const wrapper = mount(Newsletter, { global: { stubs: { Teleport: true } } });
    await nextTick();

    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('updates email on input', async () => {
    const wrapper = mount(Newsletter, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('input[type="email"]').setValue('hal@paradigm.com.jm');
    const vm = wrapper.vm as any;
    expect(vm.email).toBe('hal@paradigm.com.jm');
  });

  it('shows success message after simulated submit', async () => {
    const wrapper = mount(Newsletter, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('input[type="email"]').setValue('hal@paradigm.com.jm');
    const vm = wrapper.vm as any;
    await vm.handleSubmit();

    // Simulation takes ~1000ms
    await new Promise(r => setTimeout(r, 1500));
    expect(vm.submitted).toBe(true);
    expect(vm.email).toBe('');
  });

  it('does not submit invalid email', async () => {
    const wrapper = mount(Newsletter, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('input[type="email"]').setValue('not-an-email');
    const vm = wrapper.vm as any;
    await vm.handleSubmit();

    // Should return early due to email validation
    expect(vm.submitted).toBe(false);
  });
});
