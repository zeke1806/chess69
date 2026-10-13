import { describe, expect, it } from '@jest/globals';
import { createInstallationCheckFrontService } from '../../src/services-front/installation-check/installation-check-service';

describe('écran de contrôle de l’installation', () => {
  it('présente la version et le message initial avec un snapshot stable', () => {
    const service = createInstallationCheckFrontService({ version: '0.1.0' });
    const initial = service.getSnapshot();

    expect(initial).toEqual({
      version: '0.1.0',
      status: 'ready',
      message: 'Prêt à tester',
    });
    expect(service.getSnapshot()).toBe(initial);
  });

  it('confirme une interaction sans altérer le snapshot initial', () => {
    const service = createInstallationCheckFrontService({ version: '0.1.0' });
    const initial = service.getSnapshot();

    service.testInteraction();

    expect(service.getSnapshot()).toEqual({
      version: '0.1.0',
      status: 'confirmed',
      message: 'Interaction confirmée',
    });
    expect(initial.message).toBe('Prêt à tester');
  });

  it('conserve le résultat et son snapshot lors des appuis répétés', () => {
    const service = createInstallationCheckFrontService({ version: '0.1.0' });
    service.testInteraction();
    const confirmed = service.getSnapshot();

    service.testInteraction();
    service.testInteraction();

    expect(service.getSnapshot()).toBe(confirmed);
    expect(service.getSnapshot().message).toBe('Interaction confirmée');
  });

  it('publie le résultat aux abonnés actifs et respecte le désabonnement', () => {
    const service = createInstallationCheckFrontService({ version: '0.1.0' });
    const messages: string[] = [];
    const removedMessages: string[] = [];
    service.subscribe(() => { messages.push(service.getSnapshot().message); });
    const unsubscribe = service.subscribe(() => {
      removedMessages.push(service.getSnapshot().message);
    });
    unsubscribe();

    service.testInteraction();
    service.testInteraction();

    expect(messages).toEqual(['Interaction confirmée']);
    expect(removedMessages).toEqual([]);
  });

  it('redémarre prête à tester dans une nouvelle instance indépendante', () => {
    const previousSession = createInstallationCheckFrontService({ version: '0.1.0' });
    previousSession.testInteraction();

    const reopenedSession = createInstallationCheckFrontService({ version: '0.1.0' });

    expect(reopenedSession.getSnapshot().message).toBe('Prêt à tester');
    expect(previousSession.getSnapshot().message).toBe('Interaction confirmée');
  });
});
