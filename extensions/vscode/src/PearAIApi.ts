import { PearAICreatorMode } from './integrations/creator';
import { IMessenger } from 'core/util/messenger';
import { FromCoreProtocol } from 'core/protocol';
import { ToCoreFromIdeOrWebviewProtocol } from 'core/protocol/core';
import { Core } from 'core/core';

/**
 * Public interface for the PearAI Extension API
 * This interface defines the public classes that other extensions can use
 */
export interface IPearAIApi {
  readonly creatorMode: PearAICreatorMode;
} 

export class PearAIApi implements IPearAIApi {
    private readonly messenger: IMessenger<ToCoreFromIdeOrWebviewProtocol, FromCoreProtocol>;
    readonly creatorMode: PearAICreatorMode;

    constructor(core: Core) {
      this.messenger = core.messenger;
      // this.ideMessenger = new SubmoduleIdeMessenger(core);
      this.creatorMode = new PearAICreatorMode(this.messenger);
    }
}