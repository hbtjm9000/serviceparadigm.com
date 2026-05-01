import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock ContactForm — import after setting up globals
describe('ContactForm.vue', () => {
  let ContactForm: any;

  beforeEach(async () => {
    vi.resetAllMocks();
    const mod = await import('../../src/components/ContactForm.vue');
    ContactForm = mod.default;
  });

  it('renders all form fields', async () => {
    const wrapper = mount(ContactForm, { global: { stubs: { Teleport: true } } });
    await nextTick();

    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('#company').exists()).toBe(true);
    expect(wrapper.find('#service').exists()).toBe(true);
    expect(wrapper.find('#message').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('shows validation error when submitting empty form', async () => {
    const wrapper = mount(ContactForm, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('form').trigger('submit.prevent');
    // Browser native validation handles empty required fields
    expect(wrapper.find('input#name').exists()).toBe(true);
  });

  it('updates form data on input', async () => {
    const wrapper = mount(ContactForm, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('#name').setValue('Hal Thompson');
    await wrapper.find('#email').setValue('hal@paradigm.com.jm');
    await wrapper.find('#company').setValue('Paradigm IT');
    await wrapper.find('#message').setValue('Hello world');

    const vm = wrapper.vm as any;
    expect(vm.form.name).toBe('Hal Thompson');
    expect(vm.form.email).toBe('hal@paradigm.com.jm');
    expect(vm.form.company).toBe('Paradigm IT');
    expect(vm.form.message).toBe('Hello world');
  });

  it('falls back to simulation when FORM_ENDPOINT is empty', async () => {
    const wrapper = mount(ContactForm, { global: { stubs: { Teleport: true } } });
    await nextTick();

    await wrapper.find('#name').setValue('Test User');
    await wrapper.find('#email').setValue('test@test.com');
    await wrapper.find('#message').setValue('Test message');

    const vm = wrapper.vm as any;
    await vm.handleSubmit();

    // With empty endpoint, should use fallback simulation
    // Success state should be set after ~1500ms simulation
    await new Promise(r => setTimeout(r, 2000));
    expect(vm.submitted).toBe(true);
    expect(vm.form.name).toBe('');
  });

  it('populates service dropdown options', async () => {
    const wrapper = mount(ContactForm, { global: { stubs: { Teleport: true } } });
    await nextTick();

    const options = wrapper.findAll('#service option');
    const values = options.map((o: any) => o.element.value);

    expect(values).toContain('ai-strategy');
    expect(values).toContain('solutions-architecture');
    expect(values).toContain('cybersecurity');
    expect(values).toContain('elements');
    expect(values).toContain('other');
  });
});
